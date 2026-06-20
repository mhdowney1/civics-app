import { SignIn } from '@clerk/nextjs'

export const metadata = { title: 'Sign in · US Civics Study' }

const appearance = {
  variables: {
    colorBackground: '#1a1a1a',
    colorNeutral: 'white',
    colorPrimary: '#4ade80',
    colorForeground: 'white',
    colorInput: '#2a2a2a',
    colorInputForeground: 'white',
  },
}

export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <SignIn appearance={appearance} />
    </main>
  )
}
