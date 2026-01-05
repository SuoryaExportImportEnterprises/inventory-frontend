// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { Layout } from "@/components/Layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
// import { fetchNotifications, markNotificationRead } from "@/api/notificationApi";

// /* ---------------- TYPES ---------------- */

// interface Notification {
//   _id: string;
//   type: "discrepancy" | "rejection" | "inward" | "outward";
//   message: string;
//   relatedInward?: string;
//   relatedOutward?: string;
//   status: "unread" | "read";
//   createdAt: string;
// }

// /* ---------------- COMPONENT ---------------- */
// const getReadableType = (notif: {
//   message: string;
// }) => {
//   const msg = notif.message.toLowerCase();

//   const hasMissing =
//     msg.includes("item missing") || msg.includes("missing");

//   const hasRejected =
//     msg.includes("rejected");

//   if (hasMissing && hasRejected) {
//     return "Item Missing & Rejection";
//   }

//   if (hasMissing) {
//     return "Item Missing";
//   }

//   if (hasRejected) {
//     return "Rejection";
//   }

//   return "Issue";
// };

// export default function Notifications() {
//   const navigate = useNavigate();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);

//   /* ---------------- FETCH ---------------- */

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetchNotifications();
//         setNotifications(res.data);
//       } catch (err) {
//         console.error("Notification fetch error", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   /* ---------------- CLICK HANDLER ---------------- */
// const handleNotificationClick = async (notif: Notification) => {
//   // 1️⃣ mark as read
//   if (notif.status === "unread") {
//     try {
//       await markNotificationRead(notif._id);
//       setNotifications((prev) =>
//         prev.map((n) =>
//           n._id === notif._id ? { ...n, status: "read" } : n
//         )
//       );
//     } catch (err) {
//       console.error("Mark read failed", err);
//     }
//   }

//   // 2️⃣ navigate based on type
//   if (notif.type === "discrepancy" && notif.relatedInward) {
//     navigate(`/admin/discrepancies/${notif.relatedInward}`);
//     return;
//   }

//   if (notif.type === "rejection" && notif.relatedInward) {
//     navigate(`/admin/discrepancies/${notif.relatedInward}`);
//     return;
//   }
// };


//   /* ---------------- UI ---------------- */

//   return (
//     // <Layout>
//       <div className="space-y-6">
//         {/* HEADER */}
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold mb-1">Notifications</h1>
//             <p className="text-muted-foreground">
//               View system notifications
//             </p>
//           </div>
//         </div>

//         {/* TABLE */}
//         <Card>

//           <CardContent>
//             <div className="rounded-md border overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Timestamp</TableHead>
//                     <TableHead>Message</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Status</TableHead>
//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {loading ? (
//                     <TableRow>
//                       <TableCell colSpan={4} className="text-center py-6">
//                         Loading...
//                       </TableCell>
//                     </TableRow>
//                   ) : notifications.length > 0 ? (
//                     notifications.map((notif) => (
//                       <TableRow
//                         key={notif._id}
//                         className="cursor-pointer hover:bg-muted/50"
//                         onClick={() => handleNotificationClick(notif)}
//                       >
//                         <TableCell className="text-xs">
//                           {new Date(notif.createdAt).toLocaleString("en-GB")}
//                         </TableCell>

//                        <TableCell className="whitespace-pre-line">
//   {(() => {
//     const lines = notif.message.split("\n");
//     const firstLine = lines[0];
//     const rest = lines.slice(1);

//     const match = firstLine.match(
//       /Inward issue recorded for (.*) from (.*)\./i
//     );



//     return (
//       <>
//         {match ? (
//           <p className="font-medium">
//             Inward issue recorded for{" "}
//             <span className="font-semibold text-orange-600">
//               {match[1]}
//             </span>{" "}
//             from{" "}
//             <span className="font-semibold text-orange-600">
//               {match[2]}
//             </span>.
//           </p>
//         ) : (
//           <p>{firstLine}</p>
//         )}

//         {rest.map((line, i) => (
//           <p key={i} className="text-sm text-muted-foreground mt-1">
//             {line}
//           </p>
//         ))}
//       </>
//     );
//   })()}
// </TableCell>




// <TableCell>
//   <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded">
//     {getReadableType(notif)}
//   </span>
// </TableCell>


//                         <TableCell>
//                           {notif.status === "unread" ? (
//                             <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded flex items-center gap-1 w-fit">
//                               <AlertCircle className="h-3 w-3" />
//                               Unread
//                             </span>
//                           ) : (
//                             <span className="text-xs px-2 py-1 bg-muted rounded flex items-center gap-1 w-fit">
//                               <CheckCircle className="h-3 w-3" />
//                               Read
//                             </span>
//                           )}
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell
//                         colSpan={4}
//                         className="text-center py-8 text-muted-foreground"
//                       >
//                         No notifications
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     // </Layout>
//   );
// }
