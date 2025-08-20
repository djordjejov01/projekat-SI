import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { ApiService } from '../../../../Services/api.service';
import 'leaflet/dist/leaflet.css';
import { PinModalComponent } from './pin-modal/pin-modal.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EventPinDto } from '../../../../Models/EventPinDto';
import { PinCategoryService } from '../../../../Services/PinCategoryService';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

import * as Leaflet from 'leaflet'
import { environment } from '../../../../../environments/environment';

// Fix Leaflet icon paths
delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png'
});

@Component({
  selector: 'app-map-section',
  imports: [CommonModule,PinModalComponent,DialogModule,ButtonModule,TooltipModule],
  templateUrl: './map-section.component.html',
  styleUrl: './map-section.component.css',
  encapsulation: ViewEncapsulation.None
})
export class MapSectionComponent implements AfterViewInit, OnChanges{

  @Input() eventBasicInfo! : EventBasicInfo;
  @ViewChild('pinModal') pinModal!: PinModalComponent;
  private map!: Leaflet.Map;
  private mainEventMarker?: Leaflet.Marker;
  private pinMarkers: Leaflet.Marker[] = [];
  private isPlacingPin = false;
  displayPinDialog = false;
  selectedPin: EventPinDto | null = null;

  @Input() pins: EventPinDto[] = [];
  @Output() pinSaved = new EventEmitter<void>();


// private pinIcons: Record<number, L.Icon> = {
//   0: this.createIcon('photo-booth.png'),
//   1: this.createIcon('stage.png'),
//   2: this.createIcon('door.png'),
//   3: this.createIcon('exit.png'),
//   4: this.createIcon('first-aid-kit.png'),
//   5: this.createIcon('fast-food.png'),
//   6: this.createIcon('soft-drink.png'),
//   7: this.createIcon('toilet.png'),
//   8: this.createIcon('information.png'),
//   9: this.createIcon('guard.png'),
//   10: this.createIcon('parking-car.png'),
//   11: this.createIcon('lost-and-found.png'),

//   12: this.createIcon('unknown.png')        // Unknown
// };

private createIcon(filename: string): Leaflet.Icon {
  return Leaflet.icon({
    iconUrl: `${environment.backendBaseUrl}/pins/${filename}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

  constructor(
    private apiService : ApiService,
    private messageService : MessageService,
    private pinCategoryService : PinCategoryService,
    private confirmationService : ConfirmationService){}

  ngAfterViewInit(): void {

    this.initMap();

    if(this.eventBasicInfo){
      this.geocodeAddress().subscribe({
        complete: () => {
          this.pinCategoryService.loadCategoriesIfEmpty().subscribe({
            complete: () => this.renderPins()
          });
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['eventBasicInfo'] && !changes['eventBasicInfo'].firstChange){
      const newInfo = changes['eventBasicInfo'].currentValue as EventBasicInfo
      if(newInfo) this.geocodeAddress().subscribe()
    }

    if(changes['pins']){
      this.renderPins();
    }
  }

  private initMap(): void
  {
    this.map = Leaflet.map('map', {
      center:[44.0165, 21.0059],
      zoom: 7
    });

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:  '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

private geocodeAddress(): Observable<void> {
  const location = this.eventBasicInfo.getLocation();

  return this.apiService.geocodeAddress(location).pipe(
    tap((results) => {
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        this.map.setView([lat, lon], 17);

        if (this.mainEventMarker) {
          this.map.removeLayer(this.mainEventMarker);
        }

        this.mainEventMarker = Leaflet.marker([lat, lon], {
          icon: Leaflet.divIcon({
            className: 'pulse-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
            html: `<div></div>`
          }),
        }).addTo(this.map)
          .bindTooltip(
            `<div style="min-width: 200px; max-width: 400px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">
              <strong>Event Location</strong><br/>
              ${location}
            </div>`,
            {
              direction: 'top',
              offset: [0, -20],
              className: 'leaflet-tooltip-event'
            }
  );

      }
    }),
    catchError((err) => {
      console.error('Geocoding error:', err);
      return of(void 0);
    }),
    map(() => void 0)
  );
}



  renderPins(){
    if(!this.map) return;

    this.pinMarkers.forEach(marker => this.map.removeLayer(marker));
    this.pinMarkers = [];

    this.pins.forEach(pin => {
      const category = pin.getPinCategory();
      const filename = this.pinCategoryService.isValidCategory(category) ? `${category}.png` : 'unknown.png';
      const icon = this.createIcon(filename);
      //console.log('Pin category type and value:', typeof category, category);


      const marker = Leaflet.marker([pin.getLatitude(), pin.getLongitude()], {
        draggable: true,
        icon,
      });


      marker.bindTooltip(`
        <div style="min-width: 200px; max-width: 400px; word-wrap: break-word; overflow-wrap: break-word;">
          <h4 style="margin: 0 0 0.3rem 0;"><strong>Pin📌:</strong> ${pin.getLabel()}</h4>
          <p style="margin: 0 0 0.3rem 0;"><strong>Type:</strong> ${this.pinCategoryService.getCategoryName(pin.getPinCategory())}</p>
          <p style="margin: 0; white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">
            <strong>Description:</strong> ${pin.getDescription() || '<em>No description</em>'}
          </p>
        </div>
      `, {
        permanent: false,
        direction: 'top',
        offset: [0, -20],
        interactive: false,
      });



      marker.on('click', (e: Leaflet.LeafletMouseEvent) => {
        this.selectedPin = pin;
        this.displayPinDialog = true;
      });

       // Handle drag end event
    marker.on('dragend', (e: Leaflet.LeafletEvent) => {
      const newLatLng = (e.target as Leaflet.Marker).getLatLng();

      this.confirmationService.confirm({
        message: `Confirm move pin "${pin.getLabel()}" to new location?`,
        header: 'Confirm Move',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          // Update pin coordinates in your DTO
          pin.setLatitude(newLatLng.lat);
          pin.setLongitude(newLatLng.lng);

          // Update backend
          this.apiService.updateMapPin(pin).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Pin Moved',
                detail: `Pin "${pin.getLabel()}" moved successfully.`,
                life: 3000,
              });
              this.pinSaved.emit(); // Notify to refresh pins
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Move Failed',
                detail: err.message || 'Unknown error',
                life: 3000,
              });
              // Reset marker position on error
              marker.setLatLng([pin.getLatitude(), pin.getLongitude()]);
            }
          });
        },
        reject: () => {
          // Reset marker to original position if user cancels
          marker.setLatLng([pin.getLatitude(), pin.getLongitude()]);
        }
      });
    });


      marker.addTo(this.map);
      this.pinMarkers.push(marker);
    });
  }

  startPlacingPin(): void {
    this.isPlacingPin = true;
    this.map.getContainer().style.cursor = 'crosshair';

    this.messageService.add({
      severity: 'info',
      summary: 'Add Pin Mode',
      detail: 'Click on the map to place your pin.',
    });

    this.map.once('click', (e: Leaflet.LeafletMouseEvent) => {
      this.isPlacingPin = false;
      this.map.getContainer().style.cursor = '';

      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      //console.log(lat,lon);
      this.openPinModal(lat,lon);
    });
  }

  openPinModal(lat: number, lon: number){
    this.pinModal.open(lat,lon)
  }

  openEditPinModal(pin: EventPinDto){
    if (!pin) return;
    this.displayPinDialog = false;
    if(!this.pinModal) return;
    this.pinModal.open(pin.getLatitude(), pin.getLongitude(), pin);

  }

  deletePin(pin : EventPinDto){
    if (!pin) return;

    this.displayPinDialog = false;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete pin "${this.selectedPin?.getLabel()}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteMapPin(pin.getId()).subscribe({
            next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Pin Deleted',
              detail: `Pin "${pin.getLabel()}" deleted successfully.`,
              life: 3000,
            });
            this.pinSaved.emit(); // Refresh pins
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: err.message || 'Unknown error',
              life: 3000,
            });
          }
          });
        }
    });
  }

  onPinSaved(pinData : EventPinDto){
      this.pinSaved.emit(); // Tell parent to refresh pins
  }

  onPinDialogClose(){
    this.selectedPin = null;
  }

}