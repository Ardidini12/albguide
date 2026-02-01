import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, whatsappNumber } = await request.json();

    const supabase = await createSupabaseServerClient();

    // Sign up the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsappNumber,
        }
      }
    });

    if (signUpError) {
      console.error('Supabase signup error:', signUpError);
      return NextResponse.json(
        { error: signUpError.message, details: signUpError },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existingProfile) {
      // Manually create profile if trigger failed
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsappNumber,
          role: 'USER'
        });

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create user profile: ' + insertError.message },
          { status: 500 }
        );
      }
    } else {
      // Update existing profile with additional info
      await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsappNumber,
        })
        .eq('id', data.user.id);
    }

    return NextResponse.json(
      { success: true, user: data.user },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
