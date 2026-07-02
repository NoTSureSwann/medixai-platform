export async function sendFCMNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
  // Mock Firebase Cloud Messaging for Phase 2
  // Real implementation will use firebase-admin: admin.messaging().send(...)
  
  console.log(`\n=============================================`);
  console.log(`[FCM NOTIFICATION MOCK]`);
  console.log(`To User ID : ${userId}`);
  console.log(`Title      : ${title}`);
  console.log(`Body       : ${body}`);
  if (data) {
    console.log(`Data       : ${JSON.stringify(data)}`);
  }
  console.log(`=============================================\n`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return { success: true, messageId: `mock-msg-${Date.now()}` };
}
