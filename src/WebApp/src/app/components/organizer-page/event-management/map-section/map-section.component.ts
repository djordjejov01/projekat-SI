import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { ApiService } from '../../../../Services/api.service';
import 'leaflet/dist/leaflet.css';
import { PinModalComponent } from './pin-modal/pin-modal.component';


import * as Leaflet from 'leaflet'
import { MessageService } from 'primeng/api';
import { EventPinDto } from '../../../../Models/EventPinDto';
import { PinCategoryService } from '../../../../Services/PinCategoryService';
import { catchError, map, Observable, of, tap } from 'rxjs';


// Fix Leaflet icon paths
delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png'
});

@Component({
  selector: 'app-map-section',
  imports: [PinModalComponent],
  templateUrl: './map-section.component.html',
  styleUrl: './map-section.component.css'
})
export class MapSectionComponent implements AfterViewInit, OnChanges{

  @Input() eventBasicInfo! : EventBasicInfo;
  @ViewChild('pinModal') pinModal!: PinModalComponent;
  private map!: Leaflet.Map;
  private mainEventMarker?: Leaflet.Marker;
  private pinMarkers: Leaflet.Marker[] = [];
  private isPlacingPin = false;

  @Input() pins: EventPinDto[] = [];
  @Output() pinSaved = new EventEmitter<void>();


  constructor(
    private apiService : ApiService,
    private messageService : MessageService,
    private pinCategoryService : PinCategoryService){}

  ngAfterViewInit(): void {
    this.initMap();

    if(this.eventBasicInfo){
      this.geocodeAddress().subscribe({
        complete: () => this.renderPins()
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
          icon: Leaflet.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        })
          .addTo(this.map)
          .bindPopup(this.eventBasicInfo.getLocation())
          .openPopup();
      }
    }),
    catchError((err) => {
      console.error('Geocoding error:', err);
      return of(void 0); // continue the stream with void
    }),
    map(() => void 0) // ensure return type is Observable<void>
  );
}


  renderPins(){
    if(!this.map) return;

    this.pinMarkers.forEach(marker => this.map.removeLayer(marker));
    this.pinMarkers = [];

    this.pins.forEach(pin => {
      const marker = Leaflet.marker([pin.getLatitude(),pin.getLongitude()],{
        icon: Leaflet.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      });

      marker.bindPopup(`
        <div style="min-width: 200px">
          <h4 style="margin: 0 0 0.3rem 0;">📍 ${pin.getLabel()}</h4>
          <p style="margin: 0 0 0.3rem 0;"><strong>Type:</strong> ${this.pinCategoryService.getCategoryName(pin.getPinCategory())}</p>
          <p style="margin: 0;">${pin.getDescription() || '<em>No description</em>'}</p>
        </div>
      `);

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

      console.log(lat,lon);
      this.openPinModal(lat,lon);
    });
  }

  openPinModal(lat: number, lon: number){
    this.pinModal.open(lat,lon)
  }


  onPinSaved(pinData : EventPinDto){

    // if (!this.map) return;

    // const marker = Leaflet.marker([pinData.getLatitude(), pinData.getLongitude()], 
    //   {
    //   icon: Leaflet.icon({
    //     iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    //     shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //   })
    // });

    // marker.bindPopup(`
    //   <div style="min-width: 200px">
    //     <h4 style="margin: 0 0 0.3rem 0;">📍 ${pinData.getLabel()}</h4>
    //     <p style="margin: 0 0 0.3rem 0;"><strong>Type:</strong> ${this.pinCategoryService.getCategoryName(pinData.getPinCategory())}</p>
    //     <p style="margin: 0;">${pinData.getDescription() || '<em>No description</em>'}</p>
    //   </div>
    // `);

    //   marker.addTo(this.map);
    //   this.pinMarkers.push(marker)
      this.pinSaved.emit(); // Tell parent to refresh pins
    // Store for backend sync if needed
    // this.pins.push(pinData);

  }


}
