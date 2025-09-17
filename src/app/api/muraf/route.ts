// src/app/api/muraf/route.ts
import {NextRequest, NextResponse} from 'next/server';

const backendUrl = 'https://sajfoods.net/muraf/muraf.php';

/**
 * This function is the core logic for proxying requests to the PHP backend.
 * It can be called directly from Server Actions to bypass the network.
 */
export async function handleApiRequest(body: any) {
  try {
    // Forward the request to the PHP backend
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get the response text from the backend
    const text = await backendResponse.text();
    
    // The backend might return an empty string for success, which is not valid JSON.
    // Handle that case.
    if (!text) {
        if (!backendResponse.ok) {
            return { status: 'error', message: `Backend returned status ${backendResponse.status} with no content.` };
        }
        return { status: 'success', message: 'Operation successful with no content.' };
    }

    try {
        const json = JSON.parse(text);
        return json;
    } catch (e) {
        console.error("Failed to parse backend JSON response:", text);
        return { status: 'error', message: 'Invalid JSON response from the backend.' };
    }

  } catch (error) {
    console.error('Backend Request Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred while contacting the backend.';
    return { status: 'error', message: errorMessage };
  }
}


// This is the Next.js API route handler.
// It receives requests from the client-side and uses the core logic.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await handleApiRequest(body);
    
    // Return the response from the backend to the original caller
    return NextResponse.json(result, {
      status: result.status === 'error' ? 500 : 200,
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred in the proxy.';
    return NextResponse.json({ status: 'error', message: errorMessage }, {
      status: 500,
    });
  }
}
