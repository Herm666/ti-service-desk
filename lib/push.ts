import webpush from "web-push";
import { db } from "@/lib/db";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

if (!publicKey || !privateKey || !subject) {
  throw new Error(
    "Variáveis VAPID não configuradas corretamente."
  );
}

webpush.setVapidDetails(
  subject,
  publicKey,
  privateKey
);

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export async function sendPushToTechTeam(
  payload: PushPayload
) {
  const subscriptions =
    await db.pushSubscription.findMany({
      where: {
        user: {
          active: true,
          role: {
            in: [
              "TECHNICIAN",
              "MANAGER",
              "ADMIN",
            ],
          },
        },
      },
    });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        );
      } catch (error: any) {
        console.error(
          "Erro ao enviar Push:",
          error
        );

        if (
          error?.statusCode === 404 ||
          error?.statusCode === 410
        ) {
          await db.pushSubscription
            .delete({
              where: {
                id: subscription.id,
              },
            })
            .catch(() => {});
        }
      }
    })
  );
}