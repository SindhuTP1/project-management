import prisma from "../configs/prisma.js";
   import { syncUserFromClerk } from "../configs/syncClerk.js";

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
    try {

        const { userId } = await req.auth({ treatPendingAsSignedOut: false });
        
           // Keep our database in sync with Clerk (replaces the webhook locally)
           try {
               await syncUserFromClerk(userId);
           } catch (err) {
               console.log("Clerk sync skipped:", err.message);
           }
        const workspaces = await prisma.workspace.findMany({
            where: {
                members: { some: { userId: userId } }
            },
            include: {
                members: { include: { user: true } },
                projects: {
                    include: {
                        tasks: { include: { assignee: true, comments: { include: { user: true } } } },
                        members: { include: { user: true } }
                    }
                },
                owner: true
            }
        });
        res.json({ workspaces });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};