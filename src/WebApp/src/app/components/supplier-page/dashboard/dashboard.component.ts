import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { DUMMY_RESOURCES, ResourceAvailability, ResourceType } from '../../../MockData/MockResources';
import { Resource } from '../../../MockData/MockResources';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
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

@Component({
  selector: 'app-dashboard',
  imports: [TableModule,ButtonModule,IconField,InputIcon,FormsModule,MultiSelect,TooltipModule,InputTextModule,CommonModule,ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent  implements OnInit{

  resources = DUMMY_RESOURCES
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

  resourceCategories = Object.entries(RESOURCE_CATEGORIES).map(([key, label]) => ({
    name: label,
    value: Number(key)
  }));

  availabilityOptions = Object.values(ResourceAvailability).map(val => ({
    name: val,
    value: val
  }));

  typeOptions = Object.values(ResourceType).map(val => ({
    name: val, // e.g. "Exhaustable"
    value: val
  }));

  selectedCategories: any[] = [];
  selectedAvailability: any[] = [];
  selectedTypes: any[] = [];


  constructor(private cd: ChangeDetectorRef,private pinCategoryService : PinCategoryService){}

  ngOnInit(): void {
    console.log(this.getResourceCategoryChartData(this.resources))
    this.initChart()
  }

    // initPieChart() {

    // const stats = this.getResourceCategoryChartData(this.resources);

    //     if (isPlatformBrowser(this.platformId)) 
    //       {
    //         const documentStyle = getComputedStyle(document.documentElement);
    //         const textColor = documentStyle.getPropertyValue('--p-text-color');
    //         const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    //         const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    //         this.pieChartData = {
    //             labels: stats.labels,
    //             datasets: [
    //                 {
    //                     label: 'Number of Users',
    //                     data: stats.counts,
    //                     backgroundColor: [
    //                           'rgba(100,106,232, 0.2)',
    //                           'rgba(126, 230, 78, 0.2)',
    //                           'rgba(180, 180, 180, 0.2)',
    //                           'rgba(233, 99, 141, 0.2)',
    //                           'rgba(255, 193, 7, 0.2)',
    //                           'rgba(23, 162, 184, 0.2)',
    //                           'rgba(153, 102, 255, 0.2)',
    //                           'rgba(108, 117, 125, 0.2)'
    //                         ],
    //                     borderColor: [
    //                           'rgba(100,106,232, 0.7)',
    //                           'rgba(126, 230, 78, 0.7)',
    //                           'rgba(180, 180, 180, 0.7)',
    //                           'rgba(233, 99, 141, 0.7)',
    //                           'rgba(255, 193, 7, 0.7)',
    //                           'rgba(23, 162, 184, 0.7)',
    //                           'rgba(153, 102, 255, 0.7)',
    //                           'rgba(108, 117, 125, 0.7)'
    //                         ],
    //                     hoverBackgroundColor:[
    //                           'rgba(100,106,232, 0.4)',
    //                           'rgba(126, 230, 78, 0.4)',
    //                           'rgba(180, 180, 180, 0.4)',
    //                           'rgba(233, 99, 141, 0.4)',
    //                           'rgba(255, 193, 7, 0.4)',
    //                           'rgba(23, 162, 184, 0.4)',
    //                           'rgba(153, 102, 255, 0.4)',
    //                           'rgba(108, 117, 125, 0.4)'
    //                         ],
    //                     borderWidth: 1
    //                 },
    //             ],
    //         };

    //         this.pieChartOptions = {
    //             plugins: {
    //                 legend: {
    //                   display: true,
    //                   position: 'top',  // force legend above chart
    //                     labels: {
    //                         color: textColor,
    //                         font: {
    //                           size: 14,
    //                         }
    //                     },
    //                 },
    //                 title: {
    //                 display: true,
    //                 text: 'User Activity Over Last 7 Days',
    //                 color: textColor,
    //                 font: { size: 16 }
    //               }
    //             },

    //             scales: {
    //                 x: {
    //                     ticks: {
    //                         color: textColorSecondary,
    //                     },
    //                     grid: {
    //                         color: surfaceBorder,
    //                     },
    //                 },
    //                 y: {
    //                     beginAtZero: true,
    //                     ticks: {
    //                         color: textColorSecondary,
    //                     },
    //                     grid: {
    //                         color: surfaceBorder,
    //                     },
    //                 },
    //             },
    //         };
    //         this.cd.markForCheck()
    //     }
    //   }

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



  getCategoryName(categoryId: number): string {
    return RESOURCE_CATEGORIES[categoryId] || 'Unknown';
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

  getTypeClass(type: ResourceType): string {
    switch (type) {
      case ResourceType.Exhaustable:
        return 'bg-[#fce7f3] text-[#a21d57]';
      case ResourceType.Inexhaustable:
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

  getResourceCategoryChartData(resources: Resource[]): { labels: string[], counts: number[] } {
    const countsMap: Record<string, number> = {};

    for (const resource of resources) {
      const categoryName = RESOURCE_CATEGORIES[resource.category] ?? 'Unknown';
      countsMap[categoryName] = (countsMap[categoryName] || 0) + 1;
    }

    const labels = Object.keys(countsMap);
    const counts = Object.values(countsMap);

    return { labels, counts };
  }

}
