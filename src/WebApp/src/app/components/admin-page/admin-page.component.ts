import { Component, OnInit } from '@angular/core';
import { User } from '../../Models/User';
import { Users } from '../../Services/user.list';
import { CommonModule } from '@angular/common';
import { StatisticCard } from './statistic-card/statistic-card.component';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule,StatisticCard],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPage implements OnInit{

  users : User[] | undefined;
  currentPage = "Dashboard";

  ngOnInit(): void {
    
    //API CALL INSTEAD DUMMY DATA
    this.users = Users.map((data)=>{
      return new User(
        data.id,
        data.username,
        data.email,
        data.password,
        data.first_name,
        data.last_name,
        data.role,
        new Date(data.creation_time),
        data.isActive,
        new Date(data.last_login)
      )
    })

    console.log(this.users)

  }

}
