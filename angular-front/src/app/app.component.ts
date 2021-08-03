import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('newMessage', { static: false }) newMessage: ElementRef;
  @ViewChild('messagesBox', { static: false }) messagesBox: ElementRef;

  userForm: FormGroup = new FormGroup({
    formUsername: new FormControl(null, [Validators.required, Validators.maxLength(20)])
  });

  socket: any;

  userName: string = '';
  message: string = '';
  messageList: {message: string, userName: string, mine: boolean}[] = [];
  userList: string[] = [];

  constructor() {

  }

  ngOnInit() {

  }

  addUser() {
    if(this.userForm.valid) {
      this.userName = this.userForm.controls['formUsername'].value;
      this.socket = io.io(`localhost:3000?userName=${this.userName}`);
  
      this.socket.emit('set-user-name', this.userName);
  
      this.socket.on('user-list', (userList: string[]) => {
        this.userList = userList;
      });
  
      this.socket.on('message-broadcast', (data: {message: string, userName: string}) => {
        if (data) {
          this.messageList.push({message: data.message, userName: data.userName, mine: false});
          this.messagesBox.nativeElement.scrollTop = this.messagesBox.nativeElement.scrollHeight + 100;
        }
      });
    } else {
      this.userForm.controls['formUsername'].markAsTouched();
    }
  }

  sendMessage(newMessage: string): void {
    this.message = newMessage;
    this.socket.emit('message', this.message);
    this.messageList.push({message: this.message, userName: this.userName, mine: true});
    this.message = '';
    this.newMessage.nativeElement.value = '';
    this.messagesBox.nativeElement.scrollTop = this.messagesBox.nativeElement.scrollHeight + 100;
  }
}
