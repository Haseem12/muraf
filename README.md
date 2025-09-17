# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file. See the `.env.example` file for a template.

`GEMINI_API_KEY`: Your API key for Google AI Studio.

## Deployment

When deploying to a platform like Vercel, you must also set these environment variables in your project's settings on the hosting platform.

### Deploying on Vercel

1.  Go to your project's dashboard on Vercel.
2.  Navigate to the **Settings** tab.
3.  Click on **Environment Variables** in the side menu.
4.  Add a new variable with the key `GEMINI_API_KEY` and paste your secret API key as the value.
5.  Redeploy your project for the changes to take effect.
