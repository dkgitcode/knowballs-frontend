import Link from 'next/link'
import { Button } from '@/components/ui/button'

// ERROR PAGE FOR AUTH FAILURES AND OTHER ISSUES ❌
export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Oops! Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We encountered an error processing your request
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/login">
                Return to Login
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                Go to Homepage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 