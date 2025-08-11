import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../../Services/api.service';
import { SupplierDto } from '../../../../Models/SupplierDto';
import { ResourceDto } from '../../../../Models/ResourceDto';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ResourceAvailability} from '../../../../MockData/MockResources';
import { PickListModule } from 'primeng/picklist';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ResourceModalComponent } from './resource-modal/resource-modal.component';

@Component({
  selector: 'app-resource-allocation',
  imports: [PickListModule,ChipModule,CommonModule,DialogModule,ResourceModalComponent],
  templateUrl: './resource-allocation.component.html',
  styleUrl: './resource-allocation.component.css'
})
export class ResourceAllocationComponent implements OnInit{

  suppliers : SupplierDto[] = []
  availableResources : ResourceDto[] = []
  allocatedResources : ResourceDto[] = []
  @ViewChild('resourceModal') resourceModal; 

  modalQueue: { resource: ResourceDto, supplier: SupplierDto }[] = [];
  isModalOpen = false;

  constructor(private apiService : ApiService, private messageService : MessageService) {}


  ngOnInit(): void {

    this.apiService.getSuppliersForOrganizer().subscribe({
      next: (response) => {
        this.suppliers = response;

        // Create an array of requests to fetch each supplier's resources
        const resourceRequests = this.suppliers.map(supplier => 
          this.apiService.getResourcesBySupplierId(supplier.getId())
        );

        // Run them all in parallel
        forkJoin(resourceRequests).subscribe({
          next: (resourcesArray) => {
            // Flatten all resources from all suppliers into one array
            this.availableResources = resourcesArray.flat();
            console.log(this.availableResources)
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error fetching resources',
              detail: error.message,
              life: 3000
            });
          }
        });
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

  findSupplier(supplierId: number): SupplierDto | undefined {
  return this.suppliers.find(s => s.getId() === supplierId);
}


  getAvailabilityText(status: ResourceAvailability): string {
  switch (status) {
    case ResourceAvailability.Available: return 'Available';
    case ResourceAvailability.Unavailable: return 'Unavailable';
    case ResourceAvailability.Booked: return 'Booked';
    default: return '';
  }
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

trackById(index: number, item: ResourceDto) {
  return item.getResourceID(); // unique id property or method
}

handleMoveToTarget(event: { items: ResourceDto[] }) {
  event.items.forEach(resource => {
    const supplier = this.findSupplier(resource.getSupplierID());
    if (supplier) {
      this.modalQueue.push({ resource, supplier });
    }
  });

  // Try to open modal if none open
  this.openNextModal();
}


onModalCancel(canceledResource: ResourceDto) {
  // Logic to handle cancellation is already good
  this.allocatedResources = this.allocatedResources.filter(
    r => r.getResourceID() !== canceledResource.getResourceID()
  );

  if (!this.availableResources.some(r => r.getResourceID() === canceledResource.getResourceID())) {
    this.availableResources = [...this.availableResources, canceledResource];
  }

  // NOTE: Do not call openNextModal() here. The modal's onHide event will now handle this.
}

handleMoveToSource(event: any) {
  console.log('Moved to source:', event.items);
}

private openNextModal() {
  if (this.isModalOpen) return;
  if (this.modalQueue.length === 0) return;

  const { resource, supplier } = this.modalQueue.shift();
  this.isModalOpen = true; // Mark as open immediately
  this.resourceModal.openModal(resource, supplier);
}


onModalSave(savedResource: ResourceDto) {
  // ✅ Keep it in allocated list
  this.isModalOpen = false;
  this.openNextModal();
}

// Add this new method to handle the modal's onHide event directly
onModalClosed() {
  this.isModalOpen = false;
  this.openNextModal(); // Now it's safe to open the next one
}

}
