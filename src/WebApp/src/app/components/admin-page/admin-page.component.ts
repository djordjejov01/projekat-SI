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
  currentDate : Date;
  startWindowLast30 : Date;
  endWindowLast30 : Date;
  startWindowPrev30 : Date;
  endWindowPrev30 : Date;
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

    this.initializeDateRangers();
    console.log(this.users)

  }

  initializeDateRangers(){

    this.currentDate = new Date();

    this.endWindowLast30 = this.currentDate;
    this.startWindowLast30 = new Date(this.currentDate);
    this.startWindowLast30.setDate(this.startWindowLast30.getDate() - 30)
    

    this.endWindowPrev30 = new Date(this.startWindowLast30)
    this.startWindowPrev30 = new Date(this.endWindowPrev30)
    this.startWindowPrev30.setDate(this.startWindowPrev30.getDate() - 30)

  }

  calculatePercentChange(current : number, previous : number) 
  {
    return previous === 0 ? 
    (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  }

  registeredTotalUsersStat() : number {

    const previousTotalUsers = this.users.filter( user => {
      return user.getCreationTime() <= this.endWindowPrev30;
    }).length;

    const currentTotalUsers = this.users.filter( user => {
      return user.getCreationTime() <= this.endWindowLast30
    }).length;

    return Math.round(this.calculatePercentChange(currentTotalUsers,previousTotalUsers));
    
  }

  getActiveCountLast30() : number {
    return this.users.filter(user => {
      if( !user.getLastLogin() ) return false; //Skip if user never logged in
      return user.getLastLogin() >= this.startWindowLast30 && user.getLastLogin() <= this.endWindowLast30;
    }).length
  } 

  activeUsersStat() : number{

    const currentPeriod = this.users.filter(user => {
      if( !user.getLastLogin() ) return false; //Skip if user never logged in
      return user.getLastLogin() >= this.startWindowLast30 && user.getLastLogin() <= this.endWindowLast30;
    }).length

    const prevPeriod = this.users.filter(user => {
      if( !user.getLastLogin() ) return false; //Skip if user never logged in
      return user.getLastLogin() >= this.startWindowPrev30 && user.getLastLogin() <= this.endWindowPrev30;
    }).length

    return this.calculatePercentChange(currentPeriod,prevPeriod)
  }

  getRegisterCountLast30() : number {
    return this.users.filter(user => {
      return user.getCreationTime() >= this.startWindowLast30 && user.getCreationTime() <= this.endWindowLast30;
    }).length
  } 

  newRegistrationsStat() : number {

    const currentPeriod = this.users.filter(user => {
      return user.getCreationTime() >= this.startWindowLast30 && user.getCreationTime() <= this.endWindowLast30;
    }).length

    const prevPeriod = this.users.filter(user => {
      return user.getCreationTime() >= this.startWindowPrev30 && user.getCreationTime() <= this.endWindowPrev30;
    }).length

    return this.calculatePercentChange(currentPeriod,prevPeriod)

  }

  getDormantCutoffDate(periodEnd : Date) : Date{
    const cutoff = new Date(periodEnd);
    cutoff.setDate(cutoff.getDate() - 90);
    return cutoff;
  }

  dormantAccountStat() : number{
    const currentCutoff = this.getDormantCutoffDate(this.endWindowLast30);
    const prevCutoff = this.getDormantCutoffDate(this.endWindowPrev30);

    const dormantCurrent = this.users.filter( user => {

      //Current period - last 30 days
      //Previous period - 30 days before the Current period
      
      if(!user.getLastLogin()) return true; //Never logged in = dormant

      //Users where last login is 90 days before the end date of the current period (current cutoff)
      return user.getLastLogin() < currentCutoff; 

    }).length

    const dormantPrevious = this.users.filter(user => {

      //Current period - last 30 days
      //Previous period - 30 days before the Current period
      //Remove the users that were registered after end of the previous period
      if( user.getCreationTime() > this.endWindowPrev30) return false;

      if(!user.getLastLogin()) return true; //Never logged in = dormant

      //Users where last login is 90 days before the end date of the previous period (previous cutoff)
      return user.getLastLogin() < prevCutoff;

    }).length

    return Math.round(this.calculatePercentChange(dormantCurrent,dormantPrevious))
  }

  getDormantCountLast30() : number{
    const currentCutoff = this.getDormantCutoffDate(this.endWindowLast30);

    return this.users.filter( user => {

      //Current period - last 30 days
      //Previous period - 30 days before the Current period
      
      if(!user.getLastLogin()) return true; //Never logged in = dormant

      //Users where last login is 90 days before the end date of the current period (current cutoff)
      return user.getLastLogin() < currentCutoff; 

    }).length
  }

}
