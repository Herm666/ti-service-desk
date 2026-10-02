"use client";

import { useEffect } from "react";

export default function PushNotifications() {
  useEffect(() => {
    async function setupPush() {
      try {
        if (!("serviceWorker" in navigator)) {
          console.log("Service Worker não suportado.");
          return;
        }

        if (!("PushManager" in window)) {
          console.log("Push não suportado neste navegador.");
          return;
        }

        if (!("Notification" in window)) {
          console.log("Notificações não suportadas.");
          return;
        }

        const registration =
          await navigator.serviceWorker.register("/sw.js");

        console.log(
          "Service Worker registrado:",
          registration
        );

        const permission =
          await Notification.requestPermission();

        if (permission !== "granted") {
          console.log(
            "Permissão de notificações não concedida."
          );
          return;
        }

        const publicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          console.error(
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada."
          );
          return;
        }

        let subscription =
          await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription =
            await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: publicKey,
            });
        }

        const response = await fetch(
          "/api/push/subscribe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscription),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Erro ao registrar assinatura Push."
          );
        }

        console.log(
          "Notificações Push ativadas:",
          data
        );
      } catch (error) {
        console.error(
          "Erro ao configurar Push:",
          error
        );
      }
    }

    setupPush();
  }, []);

  return null;
}