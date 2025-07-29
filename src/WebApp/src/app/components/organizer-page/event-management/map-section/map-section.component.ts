import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { EventBasicInfo } from '../../../../Models/EventBasicInfo';
import { ApiService } from '../../../../Services/api.service';
import 'leaflet/dist/leaflet.css';
import { PinModalComponent } from './pin-modal/pin-modal.component';


import * as Leaflet from 'leaflet'
import { MessageService } from 'primeng/api';
import { PinDataDto, PinTypeMap } from '../../../../Models/PinDataDto';

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
  private isPlacingPin = false;

  constructor(private apiService : ApiService, private messageService : MessageService){}

  ngAfterViewInit(): void {
    this.initMap();

    if(this.eventBasicInfo){
      this.geocodeAddress();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['eventBasicInfo'] && !changes['eventBasicInfo'].firstChange){
      const newInfo = changes['eventBasicInfo'].currentValue as EventBasicInfo
      if(newInfo) this.geocodeAddress()
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

  private geocodeAddress(){

    if(this.mainEventMarker) this.map.removeLayer(this.mainEventMarker);

    this.apiService.geocodeAddress(this.eventBasicInfo.getLocation()).subscribe({
      next: (results) => {
        if(results.length > 0){
          const result = results[0]
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);

          this.map.setView([lat,lon],17);

        this.mainEventMarker =  Leaflet.marker([lat,lon],{
            icon: Leaflet.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          }).addTo(this.map).bindPopup(this.eventBasicInfo.getLocation()).openPopup();
        }
      },

      error: (err) =>{
        console.error("Geocoding error:", err);
      }
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


  onPinSaved(pinData : PinDataDto){

    const marker = Leaflet.marker([pinData.getLat(), pinData.getLon()], 
      {
      icon: Leaflet.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })
    });

    marker.bindPopup(`
      <div style="min-width: 200px">
        <h4 style="margin: 0 0 0.3rem 0;">📍 ${pinData.getTitle()}</h4>
        <p style="margin: 0 0 0.3rem 0;"><strong>Type:</strong> ${PinTypeMap[pinData.getType()]}</p>
        <p style="margin: 0;">${pinData.getDescription() || '<em>No description</em>'}</p>
      </div>
    `);

      marker.addTo(this.map);
    // Store for backend sync if needed
    // this.pins.push(pinData);

  }


}
