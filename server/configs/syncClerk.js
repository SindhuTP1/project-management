import { clerkClient } from "@clerk/express";
import prisma from "./prisma.js";

const toRole = (clerkRole) => (clerkRole === "org:admin" ? "ADMIN" : "MEMBER");

// Copy the logged-in user's own Clerk account into our User table
const upsertCurrentUser = async (userId) => {
    const u = await clerkClient.users.getUser(userId);
    const email =
        u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ||
        u.emailAddresses[0]?.emailAddress;
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || email;

    await prisma.user.upsert({
        where: { id: u.id },
        update: { name, email, image: u.imageUrl },
        create: { id: u.id, name, email, image: u.imageUrl },
    });
};

// Copy the logged-in user, their Clerk organizations, and EVERY member of those
// organizations into our database. This does locally what the Clerk webhook
// (via Inngest) does in production, so accepted invitations show up in the app.
export const syncUserFromClerk = async (userId) => {
    await upsertCurrentUser(userId);

    const { data: myMemberships } = await clerkClient.users.getOrganizationMembershipList({ userId });

    for (const mine of myMemberships) {
        const org = mine.organization;

        // All people currently in this organization (accepted invitations only)
        const { data: members } = await clerkClient.organizations.getOrganizationMembershipList({
            organizationId: org.id,
            limit: 100,
        });

        // 1) Make sure every member exists in our User table
        const savedUserIds = new Set();
        for (const m of members) {
            const p = m.publicUserData;
            if (!p?.userId || !p.identifier) continue;
            try {
                const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || p.identifier;
                await prisma.user.upsert({
                    where: { id: p.userId },
                    update: { name, email: p.identifier, image: p.imageUrl },
                    create: { id: p.userId, name, email: p.identifier, image: p.imageUrl },
                });
                savedUserIds.add(p.userId);
            } catch (err) {
                console.log("Sync: skipped user", p.identifier, "-", err.message);
            }
        }

        // 2) Make sure the workspace exists (its owner must already be saved)
        const ownerId = savedUserIds.has(org.createdBy) ? org.createdBy : userId;
        await prisma.workspace.upsert({
            where: { id: org.id },
            update: { name: org.name, slug: org.slug, image_url: org.imageUrl },
            create: { id: org.id, name: org.name, slug: org.slug, ownerId, image_url: org.imageUrl },
        });

        // 3) Make sure every saved person is a member of the workspace
        for (const m of members) {
            const memberId = m.publicUserData?.userId;
            if (!memberId || !savedUserIds.has(memberId)) continue;
            const role = toRole(m.role);
            await prisma.workspaceMember.upsert({
                where: { userId_workspaceId: { userId: memberId, workspaceId: org.id } },
                update: { role },
                create: { userId: memberId, workspaceId: org.id, role },
            });
        }
    }
};