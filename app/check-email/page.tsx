import Link from 'next/link'
import { Button } from '@/components/ui/button'

// CHECK EMAIL PAGE - SHOWN AFTER SIGNUP TO PROMPT EMAIL VERIFICATION 📧
export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We've sent you a verification link. Please check your email to continue.
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/login">
                Return to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 