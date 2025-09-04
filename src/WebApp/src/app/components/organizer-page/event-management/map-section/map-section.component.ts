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
import { TranslateModule,TranslateService } from '@ngx-translate/core';

import * as Leaflet from 'leaflet';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-map-section',
  imports: [TranslateModule,CommonModule, PinModalComponent, DialogModule, ButtonModule, TooltipModule],
  templateUrl: './map-section.component.html',
  styleUrls: ['./map-section.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapSectionComponent implements AfterViewInit, OnChanges {

  @Input() eventBasicInfo!: EventBasicInfo;
  @ViewChild('pinModal') pinModal!: PinModalComponent;
  private map!: Leaflet.Map;
  private mainEventMarker?: Leaflet.Marker;
  private pinMarkers: Leaflet.Marker[] = [];
  private isPlacingPin = false;
  displayPinDialog = false;
  selectedPin: EventPinDto | null = null;

  @Input() pins: EventPinDto[] = [];
  @Output() pinSaved = new EventEmitter<void>();

  private createIcon(filename: string): Leaflet.Icon {
    return Leaflet.icon({
      iconUrl: `${environment.backendBaseUrl}/pins/${filename}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private pinCategoryService: PinCategoryService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();

    if (this.eventBasicInfo) {
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
    if (changes['eventBasicInfo'] && !changes['eventBasicInfo'].firstChange) {
      const newInfo = changes['eventBasicInfo'].currentValue as EventBasicInfo;
      if (newInfo) this.geocodeAddress().subscribe();
    }

    if (changes['pins']) {
      this.renderPins();
    }
  }

  private initMap(): void {
    this.map = Leaflet.map('map', {
      center: [44.0165, 21.0059],
      zoom: 7
    });

    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
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
                <strong>${this.translate.instant('MAP.EVENT_LOCATION')}</strong><br/>
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

  renderPins() {
    if (!this.map) return;

    this.pinMarkers.forEach(marker => this.map.removeLayer(marker));
    this.pinMarkers = [];

    this.pins.forEach(pin => {
      const category = pin.getPinCategory();
      const filename = this.pinCategoryService.isValidCategory(category) ? `${category}.png` : 'unknown.png';
      const icon = this.createIcon(filename);

      const marker = Leaflet.marker([pin.getLatitude(), pin.getLongitude()], {
        draggable: true,
        icon,
      });

      marker.bindTooltip(`
        <div style="min-width: 200px; max-width: 400px; word-wrap: break-word; overflow-wrap: break-word;">
          <h4 style="margin: 0 0 0.3rem 0;"><strong>${this.translate.instant('MAP.PIN')}: </strong> ${pin.getLabel()}</h4>
          <p style="margin: 0 0 0.3rem 0;"><strong>${this.translate.instant('MAP.TYPE')}: </strong> ${this.pinCategoryService.getCategoryName(pin.getPinCategory())}</p>
          <p style="margin: 0; white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">
            <strong>${this.translate.instant('MAP.DESCRIPTION')}:</strong> ${pin.getDescription() || `<em>${this.translate.instant('MAP.NO_DESCRIPTION')}</em>`}
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

      marker.on('dragend', (e: Leaflet.LeafletEvent) => {
        const newLatLng = (e.target as Leaflet.Marker).getLatLng();

        this.confirmationService.confirm({
          message: this.translate.instant('MAP.CONFIRM_MOVE_PIN', { pinLabel: pin.getLabel() }),
          header: this.translate.instant('MAP.CONFIRM_MOVE_HEADER'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            pin.setLatitude(newLatLng.lat);
            pin.setLongitude(newLatLng.lng);

            this.apiService.updateMapPin(pin).subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('MAP.PIN_MOVED'),
                  detail: this.translate.instant('MAP.PIN_MOVED_DETAIL', { pinLabel: pin.getLabel() }),
                  life: 3000,
                });
                this.pinSaved.emit();
              },
              error: (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('MAP.MOVE_FAILED'),
                  detail: err.message || this.translate.instant('MAP.UNKNOWN_ERROR'),
                  life: 3000,
                });
                marker.setLatLng([pin.getLatitude(), pin.getLongitude()]);
              }
            });
          },
          reject: () => {
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
      summary: this.translate.instant('MAP.ADD_PIN_MODE'),
      detail: this.translate.instant('MAP.CLICK_TO_PLACE_PIN'),
    });

    this.map.once('click', (e: Leaflet.LeafletMouseEvent) => {
      this.isPlacingPin = false;
      this.map.getContainer().style.cursor = '';

      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      this.openPinModal(lat, lon);
    });
  }

  openPinModal(lat: number, lon: number) {
    this.pinModal.open(lat, lon);
  }

  openEditPinModal(pin: EventPinDto) {
    if (!pin) return;
    this.displayPinDialog = false;
    if (!this.pinModal) return;
    this.pinModal.open(pin.getLatitude(), pin.getLongitude(), pin);
  }

  deletePin(pin: EventPinDto) {
    if (!pin) return;

    this.displayPinDialog = false;

    this.confirmationService.confirm({
      message: this.translate.instant('MAP.CONFIRM_DELETE_PIN', { pinLabel: this.selectedPin?.getLabel() }),
      header: this.translate.instant('MAP.CONFIRM_DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.deleteMapPin(pin.getId()).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('MAP.PIN_DELETED'),
              detail: this.translate.instant('MAP.PIN_DELETED_DETAIL', { pinLabel: pin.getLabel() }),
              life: 3000,
            });
            this.pinSaved.emit();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('MAP.DELETE_FAILED'),
              detail: err.message || this.translate.instant('MAP.UNKNOWN_ERROR'),
              life: 3000,
            });
          }
        });
      }
    });
  }

  onPinSaved(pinData: EventPinDto) {
    this.pinSaved.emit();
  }

  onPinDialogClose() {
    this.selectedPin = null;
  }
}
