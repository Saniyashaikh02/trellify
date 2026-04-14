// import toast from 'react-hot-toast';

// class NotificationManager {
//   constructor() {
//     this.permission = false;
//     this.init();
//   }

//   async init() {
//     if ('Notification' in window) {
//       try {
//         const permission = await Notification.requestPermission();
//         this.permission = permission === 'granted';
//       } catch (error) {
//         console.error("Permission error:", error);
//         this.permission = false;
//       }
//     }
//   }

//   show(title, options = {}) {
//     try {
//       if (this.permission && 'Notification' in window) {
//         return new Notification(title, {
//           icon: '/logo192.png',
//           ...options
//         });
//       }

//       // fallback toast
//       toast[options.type || 'success'](title);

//     } catch (error) {
//       console.error("Notification error:", error);
//       toast[options.type || 'success'](title);
//     }
//   }

//   scheduleReminder(task, dueDate) {
//     try {
//       const now = new Date();
//       const due = new Date(dueDate);
//       const timeUntilDue = due - now;

//       if (timeUntilDue > 0 && timeUntilDue <= 24 * 60 * 60 * 1000) {
//         setTimeout(() => {
//           this.show(`⏰ "${task.title}" is due soon!`, {
//             body: `Due: ${due.toLocaleDateString()}`,
//             type: 'warning'
//           });
//         }, Math.max(timeUntilDue - 30 * 60 * 1000, 0));
//       }
//     } catch (error) {
//       console.error("Schedule error:", error);
//     }
//   }
// }

// // ✅ VERY IMPORTANT
// export const notifications = new NotificationManager();