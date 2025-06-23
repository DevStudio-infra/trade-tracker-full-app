import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserProfileMenu() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (user?.fullName) {
      const nameParts = user.fullName.split(" ");
      const firstInitial = nameParts[0]?.[0] || "";
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] : "";
      setInitials(`${firstInitial}${lastInitial}`);
    }
  }, [user?.fullName]);

  if (!isLoaded) {
    return (
      <Button variant="ghost" size="sm" className="w-9 px-0">
        <Avatar>
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0">
          <UserButton afterSignOutUrl="/" />
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
