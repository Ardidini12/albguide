// app/admin/packages/page.tsx
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PackageCard } from './PackageCard'
import { FilterManager } from './FilterManager'

// ---------------------------------------------------------
// 1. SERVER ACTIONS
// ---------------------------------------------------------
async function addRegionFilter(formData: FormData) {
  'use server'
  const name = formData.get('name')
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Region name is required')
  }
  try {
    const result = await prisma.regionFilter.create({
      data: { name: name.trim() }
    })
    revalidatePath('/admin/packages', 'page')
    return { success: true, id: result.id }
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Region already exists')
    }
    if (error.code === 'P2021') {
      throw new Error('Database table does not exist. Please run: npx prisma migrate deploy')
    }
    throw new Error(`Failed to add region: ${error.message || error.code || 'Unknown error'}`)
  }
}

async function removeRegionFilter(id: string) {
  'use server'
  try {
    await prisma.regionFilter.delete({
      where: { id }
    })
    revalidatePath('/admin/packages', 'page')
  } catch (error) {
    throw new Error('Failed to remove region')
  }
}

async function addTypeFilter(formData: FormData) {
  'use server'
  const name = formData.get('name')
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Type name is required')
  }
  try {
    const result = await prisma.typeFilter.create({
      data: { name: name.trim() }
    })
    revalidatePath('/admin/packages', 'page')
    return { success: true, id: result.id }
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Type already exists')
    }
    if (error.code === 'P2021') {
      throw new Error('Database table does not exist. Please run: npx prisma migrate deploy')
    }
    throw new Error(`Failed to add type: ${error.message || error.code || 'Unknown error'}`)
  }
}

async function removeTypeFilter(id: string) {
  'use server'
  try {
    await prisma.typeFilter.delete({
      where: { id }
    })
    revalidatePath('/admin/packages', 'page')
  } catch (error) {
    throw new Error('Failed to remove type')
  }
}

async function addRegionAction(name: string) {
  'use server'
  try {
    const formData = new FormData()
    formData.append('name', name)
    await addRegionFilter(formData)
    revalidatePath('/admin/packages', 'page')
  } catch (error) {
    throw error
  }
}

async function addTypeAction(name: string) {
  'use server'
  try {
    const formData = new FormData()
    formData.append('name', name)
    await addTypeFilter(formData)
    revalidatePath('/admin/packages', 'page')
  } catch (error) {
    throw error
  }
}

async function createPackage(formData: FormData) {
  'use server'

  // Helper function to validate required string fields
  const getRequiredString = (fieldName: string): string => {
    const value = formData.get(fieldName)
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Missing or invalid required field: ${fieldName}`)
    }
    return value.trim()
  }

  // Helper function to validate and parse numeric fields
  const getRequiredNumber = (fieldName: string): number => {
    const value = formData.get(fieldName)
    if (!value || typeof value !== 'string') {
      throw new Error(`Missing or invalid required field: ${fieldName}`)
    }
    const parsed = Number(value)
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(`Invalid number for field ${fieldName}: must be a positive number`)
    }
    return parsed
  }

  // Helper function to get optional string fields
  const getOptionalString = (fieldName: string): string => {
    const value = formData.get(fieldName)
    return (value && typeof value === 'string') ? value.trim() : ''
  }

  try {
    // A. Extract and validate required string fields
    const title = getRequiredString('title')
    const description = getRequiredString('description')
    const location = getRequiredString('location')
    const region = getRequiredString('region')
    const type = getRequiredString('type')
    const durationText = getRequiredString('durationText')

    // B. Extract and validate numeric fields
    const price = getRequiredNumber('price')
    const duration = getRequiredNumber('duration')
    
    // Validate duration is a reasonable integer
    const durationInt = Math.floor(duration)
    if (durationInt !== duration || durationInt < 1 || durationInt > 365) {
      throw new Error('Duration must be a positive integer between 1 and 365 days')
    }

    // C. Handle optional fields defensively
    const featuresRaw = getOptionalString('features')
    const featuresList = featuresRaw
      ? featuresRaw.split(',').map((f) => f.trim()).filter(f => f !== '')
      : []

    const imageUrl = getOptionalString('imageUrl')
    const images = imageUrl ? [imageUrl] : []

    // D. Save to Database with error handling
    await prisma.package.create({
      data: {
        title,
        description,
        price,
        duration: durationInt,
        durationText,
        location,
        region,
        type,
        features: featuresList,
        images,
        isPopular: true
      }
    })

    // E. Only refresh on success
    revalidatePath('/admin/packages')
  } catch (error) {
    // Log error and rethrow with context
    console.error('Failed to create package:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create package: ${error.message}`)
    }
    throw new Error('Failed to create package: Unknown error occurred')
  }
}

async function updatePackage(id: string, formData: FormData) {
  'use server'

  // Validate ID
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Invalid package ID')
  }

  // Helper functions (same as createPackage)
  const getRequiredString = (fieldName: string): string => {
    const value = formData.get(fieldName)
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Missing or invalid required field: ${fieldName}`)
    }
    return value.trim()
  }

  const getRequiredNumber = (fieldName: string): number => {
    const value = formData.get(fieldName)
    if (!value || typeof value !== 'string') {
      throw new Error(`Missing or invalid required field: ${fieldName}`)
    }
    const parsed = Number(value)
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error(`Invalid number for field ${fieldName}: must be a positive number`)
    }
    return parsed
  }

  const getOptionalString = (fieldName: string): string => {
    const value = formData.get(fieldName)
    return (value && typeof value === 'string') ? value.trim() : ''
  }

  try {
    // Extract and validate required fields
    const title = getRequiredString('title')
    const description = getRequiredString('description')
    const location = getRequiredString('location')
    const region = getRequiredString('region')
    const type = getRequiredString('type')
    const durationText = getRequiredString('durationText')

    // Validate numeric fields
    const price = getRequiredNumber('price')
    const duration = getRequiredNumber('duration')
    
    const durationInt = Math.floor(duration)
    if (durationInt !== duration || durationInt < 1 || durationInt > 365) {
      throw new Error('Duration must be a positive integer between 1 and 365 days')
    }

    // Handle optional fields defensively
    const featuresRaw = getOptionalString('features')
    const featuresList = featuresRaw
      ? featuresRaw.split(',').map((f) => f.trim()).filter(f => f !== '')
      : []

    const imageUrl = getOptionalString('imageUrl')
    const images = imageUrl ? [imageUrl] : []

    await prisma.package.update({
      where: { id },
      data: {
        title,
        description,
        price,
        duration: durationInt,
        durationText,
        location,
        region,
        type,
        features: featuresList,
        images,
      }
    })

    revalidatePath('/admin/packages')
  } catch (error) {
    console.error('Failed to update package:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to update package: ${error.message}`)
    }
    throw new Error('Failed to update package: Unknown error occurred')
  }
}

async function deletePackage(id: string) {
  'use server'

  await prisma.package.delete({
    where: { id }
  })

  revalidatePath('/admin/packages')
}

// ---------------------------------------------------------
// 2. THE VISUALS (The Admin Form)
// ---------------------------------------------------------
// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'

export default async function PackagesManagementPage() {
  type Package = Awaited<ReturnType<typeof prisma.package.findMany>>[0]
  
  let packages: Package[]
  let regions: { id: string; name: string }[] = []
  let types: { id: string; name: string }[] = []
  
  try {
    packages = await prisma.package.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Failed to fetch packages:', error)
    packages = []
  }

  try {
    regions = await prisma.regionFilter.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error: any) {
    if (error.code === 'P2021') {
      // Table doesn't exist
    }
    regions = []
  }

  try {
    types = await prisma.typeFilter.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error: any) {
    if (error.code === 'P2021') {
      // Table doesn't exist
    }
    types = []
  }
  
  // Serialize packages: convert Decimal to number for client component
  const serializedPackages = packages.map((pkg: Package) => ({
    ...pkg,
    price: Number(pkg.price)
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <a href="/admin" className="text-blue-600 hover:underline mb-2 inline-block">← Back to Dashboard</a>
          <h1 className="text-3xl font-bold text-gray-800">Package Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* --- LEFT: THE FORM --- */}
          <div className="bg-white p-8 rounded-xl shadow border border-gray-100 h-fit lg:col-span-1">
            <h2 className="text-xl font-bold mb-6 text-blue-600">Create New Package</h2>
            
            <form action={createPackage} className="space-y-4">
              
              {/* Title & Price */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Package Title</label>
                <input name="title" placeholder="e.g. Albanian Riviera Escape" className="w-full p-2 border rounded mt-1" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Price (€)</label>
                <input name="price" type="number" step="0.01" placeholder="899" className="w-full p-2 border rounded mt-1" required />
              </div>

              {/* Location Data */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Region (Filter)</label>
                  <select name="region" className="w-full p-2 border rounded mt-1" required>
                    {regions.length > 0 ? (
                      regions.map((r) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))
                    ) : (
                      <option value="">No regions available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Type (Filter)</label>
                  <select name="type" className="w-full p-2 border rounded mt-1" required>
                    {types.length > 0 ? (
                      types.map((t) => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))
                    ) : (
                      <option value="">No types available</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Location Label</label>
                <input name="location" placeholder="e.g. South Albania" className="w-full p-2 border rounded mt-1" required />
              </div>

              {/* Duration Logic */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Days (Num)</label>
                  <input name="duration" type="number" placeholder="7" className="w-full p-2 border rounded mt-1" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Duration Text</label>
                  <input name="durationText" placeholder="7 days / 6 nights" className="w-full p-2 border rounded mt-1" required />
                </div>
              </div>

              {/* Image & Description */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Image Link</label>
                <input name="imageUrl" placeholder="/images/riviera.jpg" className="w-full p-2 border rounded mt-1" required />
                <p className="text-xs text-gray-400 mt-1">Use a public link or local path</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea name="description" rows={3} placeholder="Short description..." className="w-full p-2 border rounded mt-1" required />
              </div>

              {/* The Bullet Points */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Features (Comma Separated)</label>
                <textarea name="features" rows={3} placeholder="Breakfast included, Boat tour, 5-star hotel" className="w-full p-2 border rounded mt-1" />
                <p className="text-xs text-gray-400 mt-1">Separate with commas!</p>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold shadow-lg transition transform active:scale-95">
                Create Package
              </button>
            </form>

            {/* Filter Management - Outside form to avoid nesting */}
            <div className="border-t pt-4 mt-6">
              <FilterManager
                regions={regions}
                types={types}
                onAddRegion={addRegionAction}
                onRemoveRegion={removeRegionFilter}
                onAddType={addTypeAction}
                onRemoveType={removeTypeFilter}
              />
            </div>
          </div>

          {/* --- RIGHT: THE PREVIEW --- */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-gray-700">Existing Packages ({packages.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serializedPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  regions={regions}
                  types={types}
                  onUpdate={updatePackage}
                  onDelete={deletePackage}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

