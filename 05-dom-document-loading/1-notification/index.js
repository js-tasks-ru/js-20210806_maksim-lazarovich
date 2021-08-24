export default class NotificationMessage {
  static prevMessage;

  constructor(
    message = '',
    {
      duration = 0,
      type = ''
    } = {}) {

    if (NotificationMessage.prevMessage) {
      NotificationMessage.prevMessage.remove();
    }

    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get notificationMessage() {
    return `
     <div class="notification ${this.type}" style="--value:${this.duration}">
       <div class="timer"></div>
       <div class="inner-wrapper">
         <div class="notification-header">${this.type}</div>
         <div class="notification-body">
          ${this.message}
         </div>
       </div>
     </div>
   `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.notificationMessage;
    this.element = element.firstElementChild;
    NotificationMessage.prevMessage = this.element;
  }

  show(element = document.body) {
    element.append(this.element);
    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.prevMessage = null;
  }
}
