import { AfterContentInit, Component, HostListener, OnInit, ViewChild, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TableLazyLoadEvent, Table, TableModule } from 'primeng/table';
import { UIChart } from 'primeng/chart';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../Services/auth.service';
import { ApiService } from '../../Services/api.service';
import { SessionService } from '../../Services/session.service';
import { ConfirmationDialogService } from '../../Services/confirmation-dialog.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { User } from '../../Models/User';
import { StatisticCard } from './statistic-card/statistic-card.component';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Tag } from 'primeng/tag';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { Toast } from 'primeng/toast';
import { RouterLink } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-admin-page',
  imports: [
    CommonModule, StatisticCard, ChartModule, TableModule, ButtonModule,
    MultiSelectModule, InputTextModule, DropdownModule, FormsModule,
    Tag, IconField, InputIcon, ToastModule, Toast, RouterLink, ConfirmDialogModule,TranslateModule
  ],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPage implements OnInit, AfterContentInit {

  // PAGE
  users: User[] = [];
  currentDate: Date;
  startWindowLast30: Date;
  endWindowLast30: Date;
  startWindowPrev30: Date;
  endWindowPrev30: Date;
  currentPage = "Dashboard";

  // CHARTS
  barChartData: any;
  barChartOptions: any;
  doughnutChartData: any;
  doughnutChartOptions: any;
  platformId = inject(PLATFORM_ID);

  @ViewChild('barChart') barChartComponent!: UIChart
  @ViewChild('doughnutChart') doughnutChartComponent!: UIChart

  // TABLE
  loading: boolean = true;
  selectedUsers: User[];
  searchValue: string;
  roles = [
    { name: 'Admin', value: 'Admin' },
    { name: 'Organizer', value: 'Organizer' },
    { name: 'Supplier', value: 'Supplier' },
    { name: 'MobileUser', value: 'MobileUser' }
  ];
  selectedRoles: any[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private authService: AuthService,
    private apiService: ApiService,
    private sessionService: SessionService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService
  ) { }

  @HostListener('window:resize')
  onResize() {
    if (this.barChartComponent && this.barChartComponent.chart) {
      this.barChartComponent.chart.resize();
      this.barChartComponent.chart.update();
    }

    if (this.doughnutChartComponent && this.doughnutChartComponent.chart) {
      this.doughnutChartComponent.chart.resize();
      this.doughnutChartComponent.chart.update();
    }
  }

  ngOnInit(): void {
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.initializeDateRangers();
        this.initBarChart();
        this.initDoughnutChart();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('error.loadUsers')
        });
      }
    });
  }

  onRoleFilterChange(selectedOptions: any[], filterFn: (val: any) => void) {
    this.selectedRoles = selectedOptions || [];
    const filterValues = this.selectedRoles.map(role => role.value);
    filterFn(filterValues.length ? filterValues : null);
  }

  ngAfterContentInit(): void {
    this.cd.detectChanges();

    const shouldShowWelcome = sessionStorage.getItem('showWelcome') === 'true';
    if (shouldShowWelcome) {
      const name = this.authService.getUserName();
      if (name) {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('welcome.title'),
          detail: this.translate.instant('welcome.back', { name }),
          life: 3000
        });
      }
      sessionStorage.removeItem('showWelcome');
    }
  }

  initBarChart() {
    const stats = this.getUserActivityLast7Days();
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      this.barChartData = {
        labels: stats.labels,
        datasets: [
          {
            label: this.translate.instant('charts.userCount'),
            data: stats.counts,
            backgroundColor: 'rgba(100,106,232, 0.2)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 1
          },
        ],
      };

      this.barChartOptions = {
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: textColor, font: { size: 14 } },
          },
          title: {
            display: true,
            text: this.translate.instant('charts.activityLast7Days'),
            color: textColor,
            font: { size: 16 }
          }
        },
        scales: {
          x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } },
          y: { beginAtZero: true, ticks: { color: textColorSecondary }, grid: { color: surfaceBorder } }
        },
      };
      this.cd.markForCheck();
    }
  }

  initDoughnutChart() {
    const stats = this.getRoleDistribution();
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');

      this.doughnutChartData = {
        labels: stats.labels,
        datasets: [
          {
            data: stats.counts,
            backgroundColor: ['rgba(100,106,232, 0.2)','rgba(126, 230, 78, 0.2)','rgba(180, 180, 180, 0.2)','rgba(233, 99, 141, 0.2)'],
            hoverBackgroundColor:  ['rgba(100,106,232, 0.4)','rgba(126, 230, 78, 0.4)','rgba(180, 180, 180, 0.4)','rgba(233, 99, 141, 0.4)'],
            borderColor:  ['rgba(100,106,232, 0.7)','rgba(126, 230, 78, 0.7)','rgba(180, 180, 180, 0.7)','rgba(233, 99, 141, 0.7)'],
            borderWidth: 1
          }
        ]
      };

      this.doughnutChartOptions = {
        cutout: '60%',
        plugins: {
          legend: { display: true, position: 'top', labels: { color: textColor } },
          title: { display: true, text: this.translate.instant('charts.roleDistribution'), color: textColor, font: { size: 16 } }
        }
      };
      this.cd.markForCheck();
    }
  }

  initializeDateRangers() {
    this.currentDate = new Date();
    this.endWindowLast30 = this.currentDate;
    this.startWindowLast30 = new Date(this.currentDate);
    this.startWindowLast30.setDate(this.startWindowLast30.getDate() - 30)
    this.endWindowPrev30 = new Date(this.startWindowLast30)
    this.startWindowPrev30 = new Date(this.endWindowPrev30)
    this.startWindowPrev30.setDate(this.startWindowPrev30.getDate() - 30)
  }

  calculatePercentChange(current: number, previous: number) {
    return previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  }

  registeredTotalUsersStat(): number {
    const previousTotalUsers = this.users.filter(user => user.getCreationTime() <= this.endWindowPrev30).length;
    const currentTotalUsers = this.users.filter(user => user.getCreationTime() <= this.endWindowLast30).length;
    return Math.round(this.calculatePercentChange(currentTotalUsers, previousTotalUsers));
  }

  getActiveCountLast30(): number {
    return this.users.filter(user => user.getLastLogin() && user.getLastLogin() >= this.startWindowLast30 && user.getLastLogin() <= this.endWindowLast30).length;
  }

  activeUsersStat(): number {
    const currentPeriod = this.getActiveCountLast30();
    const prevPeriod = this.users.filter(user => user.getLastLogin() && user.getLastLogin() >= this.startWindowPrev30 && user.getLastLogin() <= this.endWindowPrev30).length;
    return this.calculatePercentChange(currentPeriod, prevPeriod);
  }

  getRegisterCountLast30(): number {
    return this.users.filter(user => user.getCreationTime() >= this.startWindowLast30 && user.getCreationTime() <= this.endWindowLast30).length;
  }

  newRegistrationsStat(): number {
    const currentPeriod = this.getRegisterCountLast30();
    const prevPeriod = this.users.filter(user => user.getCreationTime() >= this.startWindowPrev30 && user.getCreationTime() <= this.endWindowPrev30).length;
    return this.calculatePercentChange(currentPeriod, prevPeriod);
  }

  getDormantCutoffDate(periodEnd: Date): Date {
    const cutoff = new Date(periodEnd);
    cutoff.setDate(cutoff.getDate() - 90);
    return cutoff;
  }

  dormantAccountStat(): number {
    const currentCutoff = this.getDormantCutoffDate(this.endWindowLast30);
    const prevCutoff = this.getDormantCutoffDate(this.endWindowPrev30);

    const dormantCurrent = this.users.filter(user => !user.getLastLogin() || user.getLastLogin() < currentCutoff).length;
    const dormantPrevious = this.users.filter(user => user.getCreationTime() <= this.endWindowPrev30 && (!user.getLastLogin() || user.getLastLogin() < prevCutoff)).length;

    return Math.round(this.calculatePercentChange(dormantCurrent, dormantPrevious));
  }

  getDormantCountLast30(): number {
    const currentCutoff = this.getDormantCutoffDate(this.endWindowLast30);
    return this.users.filter(user => !user.getLastLogin() || user.getLastLogin() < currentCutoff).length;
  }

  getUserActivityLast7Days(): { counts: number[], labels: string[] } {
    const counts: number[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(this.currentDate);
      day.setHours(0, 0, 0, 0);
      day.setDate(this.currentDate.getDate() - i);
      const dayTime = day.getTime();
      labels.push(day.toLocaleDateString(undefined, { weekday: 'short' }));
      counts.push(this.users.filter(user => {
        const lastLogin = user.getLastLogin();
        if (!lastLogin) return false;
        const loginDate = new Date(lastLogin);
        loginDate.setHours(0, 0, 0, 0);
        return loginDate.getTime() === dayTime;
      }).length);
    }
    return { counts, labels };
  }

  getRoleDistribution(): { counts, labels } {
    const roleCounts: Record<string, number> = {};
    for (const user of this.users) {
      const role = user.getRole();
      roleCounts[role] ? roleCounts[role]++ : roleCounts[role] = 1;
    }
    return { counts: Object.values(roleCounts), labels: Object.keys(roleCounts) };
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Inactive': return 'danger';
      case 'Active': return 'success';
      default: return null;
    }
  }

  clear(table: Table) {
    table.clear();
    this.selectedUsers = [];
    this.searchValue = '';
  }

  async toggleUserActivation(user: User) {
    const newStatus = !user.userActive();
    const confirmed = await this.confirmationDialogService.confirm(
      this.translate.instant('confirm.toggleDetail', { action: this.translate.instant(newStatus ? 'actions.activate' : 'actions.deactivate'), user: user.getUsername() }),
      this.translate.instant('confirm.toggleTitle', { action: this.translate.instant(newStatus ? 'actions.activate' : 'actions.deactivate') })
    );
    if (!confirmed) return;
    this.apiService.activateUser(user.getUserId(), newStatus).subscribe({
      next: () => {
        user.setActive(newStatus);
        this.messageService.add({
          severity: newStatus ? 'success' : 'info',
          summary: this.translate.instant(newStatus ? 'messages.activatedTitle' : 'messages.deactivatedTitle'),
          detail: this.translate.instant(newStatus ? 'messages.activatedDetail' : 'messages.deactivatedDetail', { user: user.getUsername() })
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: this.translate.instant('error.toggleFail', { action: this.translate.instant(newStatus ? 'actions.activate' : 'actions.deactivate'), user: user.getUsername() })
        });
      }
    });
  }

  onLogoutClick() {
    this.sessionService.logoutWithConfirmation();
  }

}
