// app/admin/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { requireAdmin } from '@/lib/supabase/auth'
import { Package, MapPin, FileText, Users, Star, Image } from 'lucide-react'

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/auth/login');
  }

  const sections = [
    {
      title: 'Packages',
      description: 'Create, edit, and manage vacation packages',
      href: '/admin/packages',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Destinations',
      description: 'Manage destination guides and information',
      href: '/admin/destinations',
      icon: MapPin,
      color: 'green'
    },
    {
      title: 'Content Management',
      description: 'Edit homepage, services, and other page content',
      href: '/admin/content',
      icon: FileText,
      color: 'purple'
    },
    {
      title: 'Bookings',
      description: 'View and manage customer bookings',
      href: '/admin/bookings',
      icon: Users,
      color: 'orange'
    },
    {
      title: 'Reviews',
      description: 'Moderate and manage package reviews',
      href: '/admin/reviews',
      icon: Star,
      color: 'yellow'
    },
    {
      title: 'User Experiences',
      description: 'Approve and manage user-submitted experiences',
      href: '/admin/experiences',
      icon: Image,
      color: 'pink'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.href} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 bg-${section.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${section.color}-600`} />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={section.href}>Manage</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  )
}