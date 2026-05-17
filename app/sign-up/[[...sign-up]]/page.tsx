import { SignUp } from '@clerk/nextjs'

export const metadata = { title: 'Sign up · US Civics Study' }

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <SignUp />
    </main>
  )
}
