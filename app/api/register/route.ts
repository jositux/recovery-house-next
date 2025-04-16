// app/api/register/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Destructure new fields from the request body
        const {email, password } = await request.json();

        // --- Server-side validation (Step 3) ---
        // Validate all required fields
        if (!email || !password) {
            return NextResponse.json({ message: 'Email y contraseña son requeridos.' }, { status: 400 });
        }
        // Basic email format check (consider a more robust regex or library)
        if (!/\S+@\S+\.\S+/.test(email)) {
             return NextResponse.json({ message: 'Formato de email inválido.' }, { status: 400 });
        }
        // Basic password length check (align with Directus policy if possible)
        if (password.length < 8) {
            return NextResponse.json({ message: 'El password debe tener al menos 8 caracteres.' }, { status: 400 });
        }
        // --- End Validation ---


        const directusUrl = process.env.NEXT_PUBLIC_SITE_BACKEND_URL;

        console.log('durectur URL ', directusUrl)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL; // Read the app URL from env
        //const roleId = process.env.DIRECTUS_REGISTER_ROLE_ID; // Role ID is commented out, assuming default role or handled by Directus
        const supervisorToken = process.env.DIRECTUS_USER_SUPERVISOR_TOKEN; // Read supervisor token

        if (!directusUrl || !appUrl || !supervisorToken) { // Check for all required URLs and token
            console.error('Directus URL, App URL, or Supervisor Token missing in environment variables.');
            return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
        }

        // --- Check User Status ---
        try {
            const statusCheckUrl = `${directusUrl}/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=status&limit=1`;
            const statusResponse = await fetch(statusCheckUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${supervisorToken}`
                }
            });

            if (!statusResponse.ok) {
                // Handle potential errors from the status check itself (e.g., token invalid, Directus down)
                console.error(`Directus user status check failed: ${statusResponse.status} ${statusResponse.statusText}`);
                // Try to parse error for more details
                try {
                    const errorData = await statusResponse.json();
                    console.error('Directus status check error details:', errorData);
                } catch (parseError) {
                    console.error('Failed to parse Directus status check error:', parseError);
                }
                // Return a generic server error, as this is an internal check failing
                return NextResponse.json({ message: 'No se pudo verificar el estado del usuario. Error del servidor.' }, { status: 500 });
            }

            const statusData = await statusResponse.json();

            if (statusData.data && statusData.data.length > 0) {
                const userStatus = statusData.data[0].status;
                if (userStatus === 'active') {
                    // User exists and is active, prevent re-registration
                    return NextResponse.json({ message: 'El usuario ya está registrado y verificado. Por favor, inicia sesión.' }, { status: 409 }); // 409 Conflict
                }
                if (userStatus !== 'unverified') {
                    // User exists and is active, prevent re-registration
                    return NextResponse.json({ message: 'El usuario esta suspendido. Por favor, contacta con nosotros.' }, { status: 409 }); // 409 Conflict
                }                
                // If status is 'unverified' or any other status (like 'invited'), we allow the registration attempt to proceed
                // This handles cases where the user started registration but didn't verify, or was invited
            }
            // If statusData.data is empty, the user does not exist, proceed with registration

        } catch (statusError) {
            console.error('Error during user status check:', statusError);
            return NextResponse.json({ message: 'Ocurrió un error inesperado durante la verificación del estado del usuario.' }, { status: 500 });
        }
        // --- End Check User Status ---

        // Construct the validation URL
        const verification_url = `${appUrl}/user/verify`;

        //first_name: first_name, // Map frontend name to Directus field
        //last_name: last_name,   // Map frontend name to Directus field

        const payload = {
            email: email,
            password: password,
            verification_url: verification_url,
        };

        const response = await fetch(`${directusUrl}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // --- Improved Error Handling ---
        if (!response.ok) {
            let errorMessage = `Registration failed with status: ${response.statusText}`;
            let statusCode = response.status; // Default to Directus status code

            try {
                const errorData = await response.json();
                // Check common Directus error structures
                if (errorData?.errors?.[0]?.message) {
                    errorMessage = errorData.errors[0].message;
                    // Example: Check for specific error conditions if Directus provides codes/consistent messages
                    if (errorMessage.toLowerCase().includes('value has to be unique')) {
                        errorMessage = 'Este correo electrónico ya está registrado.';
                        statusCode = 409; // Conflict status code is appropriate
                    } else if (errorMessage.toLowerCase().includes('password does not meet')) {
                        errorMessage = 'La contraseña no cumple con los requisitos de seguridad.';
                         statusCode = 400;
                    }
                    // Add more specific checks based on Directus error responses
                }
            } catch (parseError) {
                // If parsing error response fails, stick with the default message
                console.error('Failed to parse Directus error response:', parseError);
            }

            console.error('Directus registration error:', errorMessage);
            // Return the specific message and appropriate status code
            return NextResponse.json({ message: errorMessage }, { status: statusCode });
        }
        // --- End Improved Error Handling ---


        // User created successfully - Directus usually returns 200 OK with user data (or 204 No Content)
        // Depending on Directus config, you might get the user data back
         try {
            // Optionally process success data if needed
            // const data = await response.json();
            // console.log("Directus registration success data:", data);
         } catch (e) { console.error("Error:", e);}


        return NextResponse.json(
          { message: 'Usuario registrado correctamente! Ahora puedes iniciar sesión.' },
          { status: 201 } // 201 Created is more specific
        );

    } catch (error) {
        console.error('Registration API Error:', error);
        // Handle potential JSON parsing errors from request.json()
        if (error instanceof SyntaxError) {
             return NextResponse.json({ message: 'Error de formato de solicitud.' }, { status: 400 });
        }
        return NextResponse.json(
          { message: 'Ocurrió un error inesperado del servidor.' },
          { status: 500 }
        );
    }
}
