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
import { take } from 'rxjs';
import { ApiService } from '../../../Services/api.service';
import { ResourceDto } from '../../../Models/ResourceDto';
import { AuthService } from '../../../Services/auth.service';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../../Services/EventCategoryService';

@Component({
  selector: 'app-dashboard',
  imports: [TableModule,ButtonModule,IconField,InputIcon,FormsModule,MultiSelect,TooltipModule,InputTextModule,CommonModule,ChartModule,ResourceModalComponent,IconFieldModule,InputIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent  implements OnInit{

  //resources = DUMMY_RESOURCES
  resources : ResourceDto[] = [];
  selectedResources : Resource[] = []
  loading = false;
  searchValue : string;

  pieChartOptions: any;
  pieChartData: any;
  platformId = inject(PLATFORM_ID);

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
  { name: 'Exhaustible', value: ResourceType.Exhaustable },
  { name: 'Inexhaustible', value: ResourceType.Inexhaustable }
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


  constructor(private cd: ChangeDetectorRef,
    private resourceAvailabilityService : ResourceAvailabilityService,
    private resourceCategoryService : ResourceCategoryService,
    private apiService : ApiService,
    private authService : AuthService,
    private messageService : MessageService
    ){}

  ngOnInit(): void {
    

    this.resourceAvailabilityService.loadAvailabilitiesIfEmpty()
    .pipe(take(1))
    .subscribe(availabilities => {
      this.resourceAvailabilityOptions = availabilities.map(availability => ({
        name: availability.name,
        value: availability.id
      }));
    });

  this.resourceCategoryService.loadCategoriesIfEmpty()
    .pipe(take(1))
    .subscribe(categories => {
      this.resourceCategoryOptions = categories.map(category => ({
        name: category.name,
        value: category.id
      }));
    });

    this.apiService.getResources(this.authService.getUserId()).subscribe({
      next: (response : ResourceDto[]) => 
        {
          this.resources = response;
          this.initChart()
        },

       error: (errorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorResponse.message,
            life: 3000 });
        }
    })


    
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
                              'rgba(100,106,232, 0.2)',
                              'rgba(126, 230, 78, 0.2)',
                              'rgba(180, 180, 180, 0.2)',
                              'rgba(233, 99, 141, 0.2)',
                              'rgba(255, 193, 7, 0.2)',
                              'rgba(23, 162, 184, 0.2)',
                              'rgba(153, 102, 255, 0.2)',
                              'rgba(108, 117, 125, 0.2)'
                            ],
                        borderColor: [
                              'rgba(100,106,232, 0.7)',
                              'rgba(126, 230, 78, 0.7)',
                              'rgba(180, 180, 180, 0.7)',
                              'rgba(233, 99, 141, 0.7)',
                              'rgba(255, 193, 7, 0.7)',
                              'rgba(23, 162, 184, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                              'rgba(108, 117, 125, 0.7)'
                            ],
                        hoverBackgroundColor:[
                              'rgba(100,106,232, 0.4)',
                              'rgba(126, 230, 78, 0.4)',
                              'rgba(180, 180, 180, 0.4)',
                              'rgba(233, 99, 141, 0.4)',
                              'rgba(255, 193, 7, 0.4)',
                              'rgba(23, 162, 184, 0.4)',
                              'rgba(153, 102, 255, 0.4)',
                              'rgba(108, 117, 125, 0.4)'
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
                        text: 'Resource Category Distribution',
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
  return this.availabilityLabels[value] ?? 'Unknown';
}

getTypeName(value: boolean): string {
  return value ? 'Exhaustible' : 'Inexhaustible';
}


// 4. For Category (lookup from resourceCategoryOptions)
getCategoryName(value: number): string {
  const category = this.resourceCategoryOptions.find(c => c.value === value);
  return category ? category.name : 'Unknown';
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

    for (const resource of resources) {
      const categoryName = this.resourceCategoryService.getCategoryName(resource.getCategory()) ?? 'Unknown';
      countsMap[categoryName] = (countsMap[categoryName] || 0) + 1;
    }

    const labels = Object.keys(countsMap);
    const counts = Object.values(countsMap);

    return { labels, counts };
  }

}
