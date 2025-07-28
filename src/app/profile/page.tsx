import getUserSession from "@/hooks/use-get-user-session";
import ProfileView from "./ProfileView";

export default async function ProfilePage() {
  const session = await getUserSession();
  const user = session?.user;
  return <ProfileView user={user} />;
}
