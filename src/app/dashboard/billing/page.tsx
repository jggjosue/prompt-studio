import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function BillingPage() {
  return (
    <div className="flex-1 space-y-6">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">Billing</h1>
            <p className="text-muted-foreground text-sm">Manage your billing information and subscription.</p>
        </div>
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>You are currently on the <strong>Pro</strong> plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 grid grid-cols-[250px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                        <span className="font-medium text-muted-foreground">Credits</span>
                        <div className="space-y-2">
                            <Progress value={25} aria-label="25% used" />
                            <p className="text-sm">850 / 4,000 credits remaining</p>
                        </div>
                    </div>
                     <div className="mb-4 grid grid-cols-[250px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                        <span className="font-medium text-muted-foreground">Price</span>
                        <p>$29/month</p>
                    </div>
                     <div className="mb-4 grid grid-cols-[250px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                        <span className="font-medium text-muted-foreground">Next payment</span>
                        <p>July 24, 2024</p>
                    </div>
                </CardContent>
                <CardFooter className="border-t flex justify-between items-center px-6 py-4">
                    <Button variant="outline">Cancel Subscription</Button>
                    <Button>Upgrade Plan</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}
