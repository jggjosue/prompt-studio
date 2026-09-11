import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your account settings and preferences.</p>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name">Name</label>
                    <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                 <div className="space-y-2">
                    <label htmlFor="current-password">Current password</label>
                    <Input id="current-password" type="password" />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="new-password">New password</label>
                    <Input id="new-password" type="password" />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </div>
    </div>
  )
}
