// resource-allocation.component.ts

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../Services/api.service';
import { SupplierDto } from '../../../../Models/SupplierDto';
import { MessageService } from 'primeng/api';
import { forkJoin, take } from 'rxjs';
import { PickListModule } from 'primeng/picklist';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ResourceModalComponent } from './resource-modal/resource-modal.component';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { ResourceCategoryService } from '../../../../Services/ResourceCategoryService';
import { EventResourceDto } from '../../../../Models/EventResourceDto';
import { ConfirmationDialogService } from '../../../../Services/confirmation-dialog.service';
import { TranslateModule,TranslateService } from '@ngx-translate/core';

export interface PicklistItem {
  resourceID: number;
  name: string;
  category: number;
  isExhaustable: boolean;
  isAvailable: number;
  description: string;
  supplierID: number;
  quantity: number;

  allocatedQuantity?: number;
  status?: number;
  startDateTimeBooked?: Date;
  endDateTimeBooked?: Date;
}

export enum EventResourceStatus {
  Pending = 0,
  Approved = 1,
  Declined = 2,
}

@Component({
  selector: 'app-resource-allocation',
  imports: [PickListModule, ChipModule, CommonModule, DialogModule, ResourceModalComponent,TranslateModule],
  templateUrl: './resource-allocation.component.html',
  styleUrls: ['./resource-allocation.component.css']
})
export class ResourceAllocationComponent implements OnInit {

  suppliers: SupplierDto[] = [];
  availableResources: PicklistItem[] = [];
  allocatedResources: PicklistItem[] = [];
  @Input() eventBasicInfo!: EventBasicInfo;
  @ViewChild('resourceModal') resourceModal;

  modalQueue: { resource: PicklistItem, supplier: SupplierDto }[] = [];
  isModalOpen = false;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private resourceCategoryService: ResourceCategoryService,
    private confirmationDialogService: ConfirmationDialogService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources() {
    this.resourceCategoryService.loadCategoriesIfEmpty().pipe(take(1)).subscribe();

    this.apiService.getSuppliersForOrganizer().subscribe({
        next: (suppliers) => {
            this.suppliers = suppliers;
            const resourceRequests = suppliers.map(supplier =>
                this.apiService.getResourcesBySupplierId(supplier.getId(), this.eventBasicInfo.getEventID())
            );

            const allocatedResourceRequest = this.apiService.getEventResourcesForEvent(this.eventBasicInfo.getEventID());
            
            forkJoin([forkJoin(resourceRequests), allocatedResourceRequest]).subscribe({
                next: ([allResources, eventResources]) => {
                    const allocatedMap = new Map<number, EventResourceDto>();
                    eventResources.forEach(res => {
                        allocatedMap.set(res.getResourceID(), res);
                    });

                    const availableList: PicklistItem[] = [];
                    const allocatedList: PicklistItem[] = [];

                    allResources.flat().forEach(resourceDto => {
                        const allocatedDetails = allocatedMap.get(resourceDto.getResourceID());

                        if (allocatedDetails) {
                            // This resource is allocated to the current event.
                            allocatedList.push({
                                resourceID: resourceDto.getResourceID(),
                                name: resourceDto.getName(),
                                category: resourceDto.getCategory(),
                                isExhaustable: resourceDto.getIsExhaustable(),
                                isAvailable: resourceDto.getIsAvailable(),
                                description: resourceDto.getDescription(),
                                supplierID: resourceDto.getSupplierID(),
                                quantity: allocatedDetails.getQuantity(), // Display allocated quantity in target list
                                allocatedQuantity: allocatedDetails.getQuantity(),
                                status: allocatedDetails.getStatus(),
                                startDateTimeBooked: allocatedDetails.getStartDateTimeBooked(),
                                endDateTimeBooked: allocatedDetails.getEndDateTimeBooked()
                            });
                            
                            // Check if there is a remaining quantity to show in the source list.
                            // The backend now handles this correctly.
                            if (resourceDto.getQuantity() > 0) {
                                availableList.push({
                                    resourceID: resourceDto.getResourceID(),
                                    name: resourceDto.getName(),
                                    category: resourceDto.getCategory(),
                                    isExhaustable: resourceDto.getIsExhaustable(),
                                    isAvailable: resourceDto.getIsAvailable(),
                                    description: resourceDto.getDescription(),
                                    supplierID: resourceDto.getSupplierID(),
                                    quantity: resourceDto.getQuantity()
                                });
                            }
                        } else {
                            // This resource is not allocated to the current event.
                            availableList.push({
                                resourceID: resourceDto.getResourceID(),
                                name: resourceDto.getName(),
                                category: resourceDto.getCategory(),
                                isExhaustable: resourceDto.getIsExhaustable(),
                                isAvailable: resourceDto.getIsAvailable(),
                                description: resourceDto.getDescription(),
                                supplierID: resourceDto.getSupplierID(),
                                quantity: resourceDto.getQuantity()
                            });
                        }
                    });

                    this.availableResources = availableList;
                    this.allocatedResources = allocatedList;
                },
                error: (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error fetching resources', detail: error.message, life: 3000 });
                }
            });
        },
        error: (errorResponse) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: errorResponse.message, life: 3000 });
        }
    });
}


  findSupplier(supplierId: number): SupplierDto | undefined {
    return this.suppliers.find(s => s.getId() === supplierId);
  }

  getCategoryName(resource: PicklistItem): string {
    return this.resourceCategoryService.getCategoryName(resource.category);
  }


getCategoryStyle(resource: PicklistItem) {
  const categoryColors: { [key: number]: { bg: string, text: string } } = {
    0: { bg: 'rgba(180,180,180,0.2)', text: 'rgba(180,180,180,1.0)' }, // Undefined
    1: { bg: 'rgba(100,106,232,0.2)', text: 'rgba(100,106,232,1.0)' }, // Equipment (purple/blue)
    2: { bg: 'rgba(126,230,78,0.2)', text: 'rgba(126,230,78,1.0)' },   // Furniture (green)
    3: { bg: 'rgba(54,162,235,0.2)', text: 'rgba(54,162,235,1.0)' },   // Electrical (blue)
    4: { bg: 'rgba(233,99,141,0.2)', text: 'rgba(233,99,141,1.0)' },   // Sanitation (pink)
    5: { bg: 'rgba(23,162,184,0.2)', text: 'rgba(23,162,184,1.0)' },   // Food & Beverage (teal)
    6: { bg: 'rgba(220,53,69,0.2)', text: 'rgba(220,53,69,1.0)' },     // Medical (red)
    7: { bg: 'rgba(153,102,255,0.2)', text: 'rgba(153,102,255,1.0)' }, // Security (purple)
    8: { bg: 'rgba(255,159,64,0.2)', text: 'rgba(255,159,64,1.0)' },   // Merchandise (orange)
    9: { bg: 'rgba(108,117,125,0.2)', text: 'rgba(108,117,125,1.0)' }, // Transportation (gray)
    10:{ bg: 'rgba(255,193,7,0.2)', text: 'rgba(255,193,7,1.0)' }      // Technology (yellow)
  };

  const c = categoryColors[resource.category] || categoryColors[0];
  return { 
    'background-color': c.bg,
    'color': c.text
  };
}


  getStatusText(status: number): string {
    switch (status) {
      case EventResourceStatus.Pending: return this.translate.instant('PENDING');
      case EventResourceStatus.Approved: return this.translate.instant('APPROVED');
      case EventResourceStatus.Declined: return this.translate.instant('DECLINED');
      default: return '';
    }
  }

getStatusClass(status: number): string {
  switch (status) {
    case EventResourceStatus.Pending:
      return 'pending-chip';
    case EventResourceStatus.Approved:
      return 'approved-chip';
    case EventResourceStatus.Declined:
      return 'declined-chip';
    default:
      return '';
  }
}


  getShortDateRange(start: Date | undefined, end: Date | undefined): string {
    if (!start || !end) {
      return '';
    }
    
    // Format the dates as 'M/d' (e.g., '8/19') or 'M/d/yy'
    const startString = `${start.getMonth() + 1}/${start.getDate()}`;
    const endString = `${end.getMonth() + 1}/${end.getDate()}`;

    // A slightly more advanced version could handle different years, etc.
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startYear === endYear) {
      return `${startString} - ${endString}`;
    } else {
      return `${startString}/${startYear.toString().substr(-2)} - ${endString}/${endYear.toString().substr(-2)}`;
    }
  }


handleMoveToTarget(event: { items: PicklistItem[] }) {
  event.items.forEach(resource => {
    // The PicklistItem has a supplierID property directly.
    const supplier = this.findSupplier(resource.supplierID); 
    if (supplier) {
      // The modal queue now holds PicklistItem
      this.modalQueue.push({ resource, supplier });
    }
  });
  this.openNextModal();
}


  async handleMoveToSource(event: { items: PicklistItem[] }) {
  // Use a temporary array to store all API requests
  const deallocationRequests = [];

  // Use a temporary array to track which items were successfully confirmed to be deallocated
  const confirmedItems = [];

  for (const item of event.items) {
    const isConfirmed = await this.confirmationDialogService.confirm(
        this.translate.instant('CONFIRM_DEALLOCATE_RESOURCE', { resourceName: item.name }),
        this.translate.instant('DEALLOCATE_RESOURCE_TITLE')
    );

    if (isConfirmed) {
      // If confirmed, add the API call to our array of requests
      deallocationRequests.push(this.apiService.deallocateResource(item.resourceID, this.eventBasicInfo.getEventID()));
      confirmedItems.push(item);
    } else {
      // If the user cancels, revert the item's position back to the allocated list.
      this.revertItem(item);
    }
  }


  // Only proceed if there are deallocation requests to send
  if (deallocationRequests.length > 0) {

      forkJoin(deallocationRequests).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('SUCCESS'),
            detail: this.translate.instant('RESOURCES_DEALLOCATED_SUCCESS'),
            life: 3000
          });
          this.loadResources();
        },
        error: err => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('DEALLOCATION_FAILED'),
            detail: err.message,
            life: 3000
          });
          this.loadResources();
        }
      });
    }
  }

  onModalSave(savedResource: PicklistItem) {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('SUCCESS'),
      detail: this.translate.instant('RESOURCE_ALLOCATION_REQUEST_SENT'),
      life: 3000
    });
    this.loadResources();
  }

onModalCancel(canceledResource: PicklistItem) {
  // Add the item back to the source list (availableResources).
  this.availableResources = [...this.availableResources, canceledResource];
  
  // Remove the item from the target list.
  this.allocatedResources = this.allocatedResources.filter(r => r.resourceID !== canceledResource.resourceID);

  // The onModalClosed event from the modal will handle opening the next modal.
}


onModalClosed() {
  this.isModalOpen = false;
  this.openNextModal();
}


private revertItem(item: PicklistItem) {
  // Add the item back to the allocated list.
  this.allocatedResources = [...this.allocatedResources, item];
  // Remove the item from the available list.
  this.availableResources = this.availableResources.filter(r => r.resourceID !== item.resourceID);
}


private openNextModal() {
  if (this.isModalOpen) return;
  if (this.modalQueue.length === 0) return;

  const { resource, supplier } = this.modalQueue.shift();
  this.isModalOpen = true; // Mark as open immediately
  this.resourceModal.openModal(resource, supplier);
}


}
