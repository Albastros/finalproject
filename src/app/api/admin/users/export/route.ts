import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/models/User";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "all";
    const search = searchParams.get("search") || "";

    let query: any = { deleted: { $ne: true } };
    if (role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("name email role createdAt isVerified")
      .sort({ createdAt: -1 })
      .lean();

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Users Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Users Report</h1>
  <p>Total: ${users.length}</p>
  <table>
    <tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Created</th><th>Transactions</th></tr>
    ${users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.isVerified ? 'Yes' : 'No'}</td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
        <td><a href="/admin/users/${u._id}" target="_blank">View</a></td>
      </tr>
    `).join('')}
  </table>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html'
      }
    });
    
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ 
      error: "Export failed: " + (error as Error).message 
    }, { status: 500 });
  }
}




























