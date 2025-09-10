import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { DUMMY_RESOURCES, ResourceAvailability, ResourceType } from '../../../MockData/MockResources';
import { Resource } from '../../../MockData/MockResources';
import { ButtonModule } from 'primeng/button';
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIcon, InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { RESOURCE_CATEGORIES } from '../../../MockData/MockResources';
import { MultiSelect } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { UIChart } from 'primeng/chart'
import { PinCategoryService } from '../../../Services/PinCategoryService';
import { ResourceModalComponent } from './resource-modal/resource-modal.component';
import { ResourceAvailabilityService } from '../../../Services/ResourceAvailabilityService';
import { ResourceCategoryService } from '../../../Services/ResourceCategoryService';
import { Subject, take, takeUntil } from 'rxjs';
import { ApiService } from '../../../Services/api.service';
import { ResourceDto } from '../../../Models/ResourceDto';
import { AuthService } from '../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../../Services/EventCategoryService';
import { ConfirmationDialogService } from '../../../Services/confirmation-dialog.service';
import { RequestsComponent } from './requests/requests.component';
import { EventResourceCalendarResponse } from '../../../Interfaces/EventResourceCalendarResponse';
import { TranslateModule,TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../Services/shared.service';
@Component({
  selector: 'app-dashboard',
  imports: [TranslateModule,RequestsComponent, TableModule, ButtonModule, IconField, InputIcon, FormsModule, MultiSelect, TooltipModule, InputTextModule, CommonModule, ChartModule, ResourceModalComponent, IconFieldModule, InputIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  //resources = DUMMY_RESOURCES
  resources: ResourceDto[] = [];
  availableResources: ResourceDto[] = [];
  selectedResources: Resource[] = []
  loading = false;
  searchValue: string;

  pieChartOptions: any;
  pieChartData: any;
  platformId = inject(PLATFORM_ID);

  isRequestsModalVisible: boolean = false; // Add this property
  currentSupplierId: number | null = null; // Add this property
  pendingRequestsCount: number = 0;

  @ViewChild('pieChart') pieChartComponent!: UIChart

  @HostListener('window:resize')
  onResize() {
    if (this.pieChartComponent && this.pieChartComponent.chart) {
      this.pieChartComponent.chart.resize();
      // Optional:
      this.pieChartComponent.chart.update();
    }
  }

resourceCategoryOptions: { name: string, value: number }[] = [];
resourceAvailabilityOptions : { name: string, value: number }[] = [];
resourceTypeOptions = [
  { name: 'Exhaustible', value: true },
  { name: 'Inexhaustible', value: false }
];


  private availabilityLabels: Record<number, string> = {
    [ResourceAvailability.Available]: 'Available',
    [ResourceAvailability.Unavailable]: 'Unavailable',
    [ResourceAvailability.Booked]: 'Booked'
  };


  selectedCategories: any[] = [];
  selectedAvailability: any[] = [];
  selectedTypes: any[] = [];
  selectedMeasures: any[] = [];
  bookedResources: EventResourceCalendarResponse[] = [];

  constructor(private cd: ChangeDetectorRef,
    private resourceAvailabilityService: ResourceAvailabilityService,
    private resourceCategoryService: ResourceCategoryService,
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService,
    private sharedEvents: SharedService
  ) { }
  private destroy$ = new Subject<void>();
  ngOnInit(): void {

    this.currentSupplierId = this.authService.getUserId();
    this.resourceAvailabilityService.loadAvailabilitiesIfEmpty()
      .pipe(take(1))
      .subscribe(availabilities => {
        this.resourceAvailabilityOptions = availabilities.map(availability => ({
          name: availability.name,
          value: availability.id
        }));
      });
    this.getBooked();
    this.resourceCategoryService.loadCategoriesIfEmpty()
      .pipe(take(1))
      .subscribe(categories => {
        this.resourceCategoryOptions = categories.map(category => ({
          name: category.name,
          value: category.id
        }));
      });

    this.fetchResources();
    this.fetchPendingRequestsCount();

    if(!this.locked)
          {
            this.sharedEvents.langChange$
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.locked = true;
            this.ngOnInit();
            // Ažuriraj grafikone
          });
          }
  }
locked = false;
  getBooked() {
    this.apiService.getBookedResources().subscribe({

      next: (response: any) => {
        this.bookedResources = response;
      },
      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translate.instant('Error'),
          life: 3000
        });
      }

    })
  }

  fetchResources() {
    this.apiService.getResources(this.authService.getUserId()).subscribe({
      next: (response: ResourceDto[]) => {
        this.resources = response;
        this.availableResources = this.resources.filter(x => x.getIsAvailable() == 0);
        ////console.log(this.resources)
        this.initChart()
      },

      error: (errorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translate.instant('Error'),
          life: 3000
        });
      }
    })
  }

  fetchPendingRequestsCount() {
    if (!this.currentSupplierId) {
      return;
    }

    this.apiService.getPendingEventResources(this.currentSupplierId)
      .subscribe({
        next: (data) => {
          this.pendingRequestsCount = data.length;
        },
        error: (err) => {
          console.error('Error fetching pending requests count:', err);
        }
      });
  }

  updateCounts() {
    this.fetchResources();
    this.fetchPendingRequestsCount();
    this.getBooked();
  }

  initChart() {

    const stats = this.getResourceCategoryChartData(this.resources);

    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');

      this.pieChartData = {
        labels: stats.labels,
        datasets: [
          {
            data: stats.counts,
            backgroundColor: [
              'rgba(100,106,232,0.2)',  // Equipment
              'rgba(126,230,78,0.2)',   // Furniture
              'rgba(255,193,7,0.2)',    // Electrical
              'rgba(233,99,141,0.2)',   // Sanitation
              'rgba(23,162,184,0.2)',   // Food & Beverage
              'rgba(220,53,69,0.2)',    // Medical
              'rgba(153,102,255,0.2)',  // Security
              'rgba(255,159,64,0.2)',   // Merchandise
              'rgba(108,117,125,0.2)',  // Transportation
              'rgba(54,162,235,0.2)',   // Technology
              'rgba(180,180,180,0.2)'   // Undefined
            ],
            borderColor: [
              'rgba(100,106,232,0.7)',
              'rgba(126,230,78,0.7)',
              'rgba(255,193,7,0.7)',
              'rgba(233,99,141,0.7)',
              'rgba(23,162,184,0.7)',
              'rgba(220,53,69,0.7)',
              'rgba(153,102,255,0.7)',
              'rgba(255,159,64,0.7)',
              'rgba(108,117,125,0.7)',
              'rgba(54,162,235,0.7)',
              'rgba(180,180,180,0.7)'
            ],
            hoverBackgroundColor: [
              'rgba(100,106,232,0.4)',
              'rgba(126,230,78,0.4)',
              'rgba(255,193,7,0.4)',
              'rgba(233,99,141,0.4)',
              'rgba(23,162,184,0.4)',
              'rgba(220,53,69,0.4)',
              'rgba(153,102,255,0.4)',
              'rgba(255,159,64,0.4)',
              'rgba(108,117,125,0.4)',
              'rgba(54,162,235,0.4)',
              'rgba(180,180,180,0.4)'
            ],
            borderWidth: 1
          }
        ]
      };


      this.pieChartOptions = {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              color: textColor
            }
          },
          title: {
            display: true,
            text: this.translate.instant('ResourceCategoryDistribution'),
            color: textColor,
            font: { size: 16 }
          }
        }
      };
      this.cd.markForCheck()
    }
  }


  onCategoryFilterChange(selectedOptions: any[], filterFn: (val: any) => void) {
    this.selectedCategories = selectedOptions || [];

    // Extract the 'value' strings to pass to the filter callback
    const filterValues = this.selectedCategories.map(role => role.value);

    filterFn(filterValues.length ? filterValues : null);
  }

  onAvailabilityFilterChange(selectedOptions: any[], filterFn: (val: any) => void) {
    this.selectedAvailability = selectedOptions || [];

    const filterValues = this.selectedAvailability.map(a => a.value);

    filterFn(filterValues.length ? filterValues : null);
  }

  onTypeFilterChange(selectedOptions: any[], filterFn: (val: any) => void) {
    this.selectedTypes = selectedOptions || [];

    const filterValues = this.selectedTypes.map(t => t.value);

    filterFn(filterValues.length ? filterValues : null);
  }

  onMeasureFilterChange(selectedOptions: any[], filterFn: (val: any) => void) {
    this.selectedMeasures = selectedOptions || [];

    const filterValues = this.selectedMeasures.map(m => m.value);

    filterFn(filterValues.length ? filterValues : null);
  }


  getAvailabilityName(value: ResourceAvailability): string {
    return this.availabilityLabels[value] ?? this.translate.instant('Unknown');
  }

  getTypeName(value: boolean): string {
    return value ? this.translate.instant('Exhaustible') : this.translate.instant('Inexhaustible');
  }


  // 4. For Category (lookup from resourceCategoryOptions)
  getCategoryName(value: number): string {
    const category = this.resourceCategoryOptions.find(c => c.value === value);
    return category ? category.name : this.translate.instant('Unknown');
  }

  getAvailabilityClass(status: ResourceAvailability): string {
    switch (status) {
      case ResourceAvailability.Available:
        return 'bg-[#dcfce7] text-[#2f784a]';
      case ResourceAvailability.Unavailable:
        return 'bg-[#fee2e2] text-[#a83838]';
      case ResourceAvailability.Booked:
        return 'bg-[#fef9c3] text-[#946325]';
      default:
        return '';
    }
  }

  getTypeClass(type: boolean): string {
    switch (type) {
      case true:
        return 'bg-[#fce7f3] text-[#a21d57]';
      case false:
        return 'bg-[#e0f2fe] text-[#0369a1]';
      default:
        return '';
    }
  }

  clear(table: Table) {
    table.clear();
    this.selectedResources = []
    this.searchValue = '';
  }

  getResourceCategoryChartData(resources: ResourceDto[]): { labels: string[], counts: number[] } {
    const countsMap: Record<string, number> = {};
    //this.translate.instant(`RESOURCE_CATEGORIES.${category.name.toUpperCase()}`)
    for (const resource of resources) {
      let categoryName = this.resourceCategoryService.getCategoryName(resource.getCategory()) ?? this.translate.instant('Unknown');
      categoryName = this.translate.instant(`RESOURCE_CATEGORIES.${categoryName.toUpperCase()}`)
      countsMap[categoryName] = (countsMap[categoryName] || 0) + 1;
    }

    const labels = Object.keys(countsMap);
    const counts = Object.values(countsMap);

    return { labels, counts };
  }

  noteSavedResource(savedResource: ResourceDto) {
    if (savedResource) {
      this.resources.push(savedResource);
      this.initChart();
    }
    else {
      this.fetchResources()
    }

  }

  deleteResource(resource: ResourceDto) {
  this.confirmationDialogService
    .confirm(this.translate.instant('RESOURCE_DASHBOARD.CONFIRM_DELETE', { resourceName: resource.getName() }))
    .then(confirmed => {

      if (!confirmed) return;

      this.apiService.deleteResource(resource.getResourceID()).subscribe({
        next: (msg) => {
          this.fetchResources();
          this.messageService.add({ 
            severity: 'success', 
            summary: this.translate.instant('RESOURCE_DASHBOARD.DELETED'), 
            detail: msg 
          });
        },
        error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('RESOURCE_DASHBOARD.ERROR'),
            detail: errorResponse.message,
            life: 3000
          });
        }
      });
    });
}


  openRequestsModal(): void {
    this.isRequestsModalVisible = true;
  }

}
