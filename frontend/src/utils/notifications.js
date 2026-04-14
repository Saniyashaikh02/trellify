// import toast from 'react-hot-toast';

// class NotificationManager {
//   constructor() {
//     this.permission = false;
//     this.init();
//   }

//   async init() {
//     if ('Notification' in window) {
//       const permission = await Notification.requestPermission();
//       this.permission = permission === 'granted';
//     }
//   }

//   show(title, options = {}) {
//     if (this.permission) {
//       return new Notification(title, {
//         icon: '/logo192.png',
//         ...options
//       });
//     }
//     // Fallback to toast
//     toast[options.type || 'success'](title);
//   }

//   scheduleReminder(task, dueDate) {
//     const now = new Date();
//     const due = new Date(dueDate);
//     const timeUntilDue = due - now;
    
//     if (timeUntilDue > 0 && timeUntilDue <= 24 * 60 * 60 * 1000) {
//       setTimeout(() => {
//         this.show(`Task "${task.title}" is due soon!`, {
//           body: `Due: ${due.toLocaleDateString()}`,
//           type: 'warning'
//         });
//       }, timeUntilDue - 30 * 60 * 1000); // Remind 30 minutes before
//     }
//   }
// }

// export const notifications = new NotificationManager();