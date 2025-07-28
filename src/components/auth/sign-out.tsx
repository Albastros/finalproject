import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { LogOut } from "lucide-react";
import { Settings } from "lucide-react";
import { UserIcon } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { useSession } from "@/hooks/use-session";
import { IconDashboard } from "@tabler/icons-react";

export function SignOut() {
  const router = useRouter();
  const { data, isPending } = useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  // console.log("data : ", data);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="flex items-center justify-center">
            {isPending ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : (
              <>
                <AvatarImage
                  src={data?.user.image || " "}
                  className="size-8 rounded-full"
                  alt="@shadcn"
                />
                <AvatarFallback className="">
                  <UserIcon className="size-6 fill-white" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-2xl border-none bg-white/80 shadow-lg backdrop-blur-sm dark:bg-black/80"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{data?.user.name}</p>
            <p className="text-xs text-muted-foreground">{data?.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            router.push("/dashboard");
          }}
          className="h-10 cursor-pointer rounded-xl hover:bg-black/70"
        >
          <IconDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            router.push("/profile");
          }}
          className="h-10 cursor-pointer rounded-xl hover:bg-black/70"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="h-10 cursor-pointer rounded-xl hover:bg-black/70"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
