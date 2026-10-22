import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
  const emailArg = process.argv[2];

  if (!emailArg || !emailArg.trim()) {
    console.error("Usage: npm run make-admin <user-email>");
    console.error("Example: npm run make-admin admin@example.com");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  console.log(`Looking up user with email: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email "${email}" not found.`);
    console.error("Please make sure the user is registered first, then run this script.");
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`User "${user.name}" (${user.email}) is already an ADMIN.`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log("Successfully assigned ADMIN role!");
  console.log({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  });
}

main()
  .catch((err) => {
    console.error("Error setting admin role:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

