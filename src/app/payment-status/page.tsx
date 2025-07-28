import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Card as ShadCard,
  CardHeader as ShadCardHeader,
  CardTitle as ShadCardTitle,
  CardContent as ShadCardContent,
} from "@/components/ui/card";

async function getBooking(bookingId: string) {
  try {
    //     const res = await axios.get(`/api/bookings?id=${bookingId}`);
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/bookings?id=${bookingId}`
    );

    return res.data.booking;
  } catch (error) {
    console.log("ERROR : ", error);
    return null;
  }
}

async function getTutor(tutorId: string) {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/users?id=${tutorId}`);
    return res.data.user;
  } catch (error) {
    console.log("ERROR fetching tutor: ", error);
    return null;
  }
}

interface PaymentStatusPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function PaymentStatusPage({ searchParams }: PaymentStatusPageProps) {
  const bookingParam = searchParams?.booking;
  const bookingId =
    typeof bookingParam === "string"
      ? bookingParam
      : Array.isArray(bookingParam)
        ? bookingParam[0]
        : undefined;

  console.log(bookingId, "ID");
  let booking = null;
  if (bookingId) {
    booking = await getBooking(bookingId);
  }
  console.log("BOOKING , ", booking);
  let tutor = null;
  if (booking && booking.tutorId) {
    tutor = await getTutor(booking.tutorId);
  }
  // Render main content
  return (
    <div className="flex flex-col gap-8 justify-center items-center min-h-[100vh] bg-white dark:bg-gray-900 transition-colors">
      {booking ? (
        booking.isPaid ? (
          <Card className="max-w-sm w-full p-6 text-center shadow-lg rounded-lg">
            <CardHeader className="flex flex-col items-center space-y-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-full p-4">
                <CheckCircle2 className="h-12 w-12 text-yellow-600 dark:text-yellow-300" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Payment Successful
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Your session booking is confirmed.
                <br />
                Thank you for trusting us!
              </p>
              <Button
                asChild
                className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              >
                <a href="/student">Go to Dashboard →</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md w-full p-8 text-center">
            <CardHeader>
              <CardTitle>Payment Not Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                We could not confirm your payment. Please try again or contact support.
              </div>
              <Button asChild>
                <a href="/student">Go to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="p-8 text-center">Booking not found.</div>
      )}
      {tutor && (
        <ShadCard className="max-w-md w-full p-6 text-center shadow-md rounded-lg border border-yellow-200 dark:border-yellow-700">
          <ShadCardHeader className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20 mx-auto mb-2">
              {tutor.profileImage ? (
                <img
                  src={tutor.profileImage}
                  alt={tutor.name}
                  className="object-cover rounded-full h-20 w-20"
                />
              ) : (
                <span className="text-3xl font-bold bg-gray-200 dark:bg-gray-700 rounded-full h-20 w-20 flex items-center justify-center">
                  {tutor.name?.[0]}
                </span>
              )}
            </Avatar>
            <ShadCardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {tutor.name}
            </ShadCardTitle>
            <div className="text-sm text-gray-500 dark:text-gray-400">{tutor.email}</div>
            {tutor.phone && (
              <div className="text-sm text-gray-500 dark:text-gray-400">{tutor.phone}</div>
            )}
          </ShadCardHeader>
          <ShadCardContent className="space-y-2">
            {tutor.bio && <div className="text-gray-700 dark:text-gray-300 mb-2">{tutor.bio}</div>}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {tutor.subjects.map((subject: string) => (
                  <span
                    key={subject}
                    className="bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            )}
          </ShadCardContent>
        </ShadCard>
      )}
    </div>
  );
}
