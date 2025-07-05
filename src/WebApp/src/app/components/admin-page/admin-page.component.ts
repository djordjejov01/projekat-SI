import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { User } from '../../Models/User';
import { Users } from '../../Services/user.list';
import { CommonModule } from '@angular/common';
import { StatisticCard } from './statistic-card/statistic-card.component';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { UIChart } from 'primeng/chart'
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-page',
  imports: [CommonModule,StatisticCard,ChartModule,TableModule, ButtonModule,
    CommonModule, MultiSelectModule, InputTextModule, DropdownModule, FormsModule ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPage implements OnInit{

  //PAGE
  users : User[] | undefined;
  currentDate : Date;
  startWindowLast30 : Date;
  endWindowLast30 : Date;
  startWindowPrev30 : Date;
  endWindowPrev30 : Date;
  currentPage = "Dashboard";

  //CHARTS
  barChartData: any;
  barChartOptions: any;
  doughnutChartData: any;
  doughnutChartOptions: any;
  platformId = inject(PLATFORM_ID);

  @ViewChild('barChart') barChartComponent!: UIChart
  @ViewChild('doughnutChart') doughnutChartComponent!: UIChart


  constructor(private cd: ChangeDetectorRef) {}

  @HostListener('window:resize')
    onResize() {
    if (this.barChartComponent && this.barChartComponent.chart) {
      this.barChartComponent.chart.resize();
      // Optional:
      this.barChartComponent.chart.update();
    }

    if (this.doughnutChartComponent && this.doughnutChartComponent.chart) {
      this.doughnutChartComponent.chart.resize();
      // Optional:
      this.doughnutChartComponent.chart.update();
    }
  }


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
    this.initBarChart()
    this.initDoughnutChart()
    console.log(this.users)

  }

  initBarChart() {

    const stats = this.getUserActivityLast7Days()

        if (isPlatformBrowser(this.platformId)) 
          {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            this.barChartData = {
                labels: stats.labels,
                datasets: [
                    {
                        label: 'Number of Users',
                        data: stats.counts,
                        backgroundColor: 'rgba(100,106,232, 0.2)',
                        borderColor: 'rgb(139, 92, 246)',
                        borderWidth: 1
                        //borderRadius: 6
                    },
                ],
            };

            this.barChartOptions = {
              // responsive: true,
              // maintainAspectRatio: false,
                plugins: {
                    legend: {
                      display: true,
                      position: 'top',  // force legend above chart
                        labels: {
                            color: textColor,
                            font: {
                              size: 14,
                            }
                        },
                    },
                    title: {
                    display: true,
                    text: 'User Activity Over Last 7 Days',
                    color: textColor,
                    font: { size: 16 }
                  }
                },

                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                },
            };
            this.cd.markForCheck()
        }
      }

  initDoughnutChart() {

    const stats = this.getRoleDistribution()

    if (isPlatformBrowser(this.platformId)) {
                const documentStyle = getComputedStyle(document.documentElement);
                const textColor = documentStyle.getPropertyValue('--p-text-color');

                this.doughnutChartData = {
                    labels: stats.labels,
                    datasets: [
                        {
                            data: stats.counts,
                            backgroundColor: ['rgba(233, 99, 141, 0.4)','rgba(100,106,232, 0.2)'],
                            hoverBackgroundColor: ['rgba(233, 99, 141, 0.7)','rgba(100,106,232, 0.4)'],
                            borderColor: ['rgba(233, 99, 141,0.7)','rgb(139, 92, 246,0.7)'],
                            borderWidth: 1
                        }
                    ]
                };

                this.doughnutChartOptions = {
                  // responsive: true,
                  // maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                          display: true,
                          position: 'top',
                            labels: {
                                color: textColor
                            }
                        },
                        title: {
                        display: true,
                        text: 'User Role Distribution',
                        color: textColor,
                        font: { size: 16 }
                      }
                    }
                };
                this.cd.markForCheck()
            }
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

  getUserActivityLast7Days() : { counts: number[], labels: string[] }{

    const counts : number[] = [];
    const labels: string[] = [];

    for(let i = 6; i >= 0; i--){

      //so we dont change the current date
      const day = new Date(this.currentDate);
      day.setHours(0, 0, 0, 0);
      day.setDate(this.currentDate.getDate() - i)

      const dayTime = day.getTime()
      
      const label = day.toLocaleDateString(undefined,{weekday: 'short'})
      labels.push(label)

      counts.push(this.users.filter(user => {

        const lastLogin = user.getLastLogin();
        if(!lastLogin) return false;
        const loginDate = new Date(lastLogin) // so we dont change the date of the user object
        loginDate.setHours(0, 0, 0, 0)
        return loginDate.getTime() === dayTime

      }).length)
    }

    console.log(counts)
    console.log(labels)
    return { counts, labels };

  }

  getRoleDistribution() : {counts, labels}{

    const roleCounts: Record<string,number> = {}

    for(const user of this.users){

      const role = user.getRole();
      if(roleCounts[role]) roleCounts[role]++;
      else roleCounts[role] = 1;

    }

    const labels = Object.keys(roleCounts);
    const counts = Object.values(roleCounts);

    return {counts, labels}
  }

}
