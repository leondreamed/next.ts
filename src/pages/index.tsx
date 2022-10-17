import { useState } from "react";
import { getUserRoute } from "~/pages/api/user.js";
import { getPrisma } from "~/utils/database/prisma.server";
import { useRoute } from "~/utils/route.client.js";
import { defineGetServerSideProps, useServerData } from "~/utils/route.js";
import { getActorFromAuth } from "~/utils/user/get.server.js";

export const getServerSideProps = defineGetServerSideProps(async (context) => {
  const { shorthands } = await getPrisma();
  const actor = await getActorFromAuth(context, shorthands.user.$actorData, {
    redirectOnNull: false,
  });

  return { data: { actor } };
});

export default function BlogPostsPage() {
  const {
    data: { actor },
  } = useServerData<typeof getServerSideProps>();
  const getUser = useRoute(getUserRoute);
  const [userId, setUserId] = useState("");

  return (
    <div>
      <strong>Actor Data:</strong> {JSON.stringify(actor)}
      <label htmlFor="userId">User ID:</label>
      <input
        id="userId"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button
        onClick={async () => {
          console.log(
            await getUser({
              searchParams: {
                userId,
              },
            })
          );
        }}
      >Find User</button>
    </div>
  );
}
