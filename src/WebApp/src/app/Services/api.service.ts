import { Injectable, Resource, resource } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from "@angular/common/http";
import { Observable, throwError, catchError, map } from "rxjs";
import { RegisterDto } from "../Models/RegisterDto";
import { LoginDto } from "../Models/LoginDto";
import { UserDto } from "../Models/UserDto";
import { User } from "../Models/User";
import { UserDtoResponse } from "../Interfaces/UserDtoResponse";
import { TokenResponse } from "../Interfaces/TokenResponse";
import { UserApiResponse } from "../Interfaces/UserApiResponse";
import { UserRoleMap } from "../Models/User";
import { OrganizerDto } from "../Models/OrganizerDto";
import { OrganizerDtoResponse } from "../Interfaces/OrganizerDtoResponse";
import { SuccessfulMessageResponse } from "../Interfaces/SuccessfulMessageResponse";
import { CreatEventDto } from "../Models/CreateEventDto";
import { EventApiResponse } from "../Interfaces/EventApiResponse";
import { Event } from "../Models/Event";
import { DashboardMetrics } from "../Interfaces/DashboardMetricsResponse";
import { StatusMetrics } from "../Interfaces/StatusMetricsResponse";
import { CategoryMetrics } from "../Interfaces/CategoryMetricsResponse";
import {StatusMap } from "../Models/Event";
import { EventCategoryApiResponse } from "../Interfaces/EventCategoryApiResponse";
import { MonthlyMetrics } from "../Interfaces/MonthlyMetricsResponse";
import { ChangePasswordDto } from "../Models/ChangePasswordDto";
import { UpdateEventDto } from "../Models/UpdateEventDto";
import { EventBasicInfo } from "../Models/EventBasicInfo";
import { EventBasicInfoApiResponse } from "../Interfaces/EventBasicInfoApiResponse";
import { ActivityDto } from "../Models/ActivityDto";
import { TicketApiResponse } from "../Interfaces/TicketApiResponse";
import { Ticket } from "../Models/Ticket";
import { TicketDto } from "../Models/TicketDto";
import { PinCategory } from "./PinCategoryService";
import { EventPinDto } from "../Models/EventPinDto";
import { EventPinApiResponse } from "../Interfaces/EventPinApiResponse";
import { SupplierDto } from "../Models/SupplierDto";
import { SupplierDtoResponse } from "../Interfaces/SupplierDtoResponse";
import { UpdateSupplierDto } from "../Models/UpdateSupplierDto";
import { ResourceCategory } from "./ResourceCategoryService";
import { ResourceAvailability } from "./ResourceAvailabilityService";
import { ResourceApiResponse } from "../Interfaces/ResourceApiResponse";
import { ResourceDto } from "../Models/ResourceDto";
import { EventResourceDto } from "../Models/EventResourceDto";
import { EventResourceApiResponse } from "../Interfaces/EventResourceApiResponse";
import { PendingRequest } from "../Interfaces/PendingRequestApiResponse";
import { EventResourceCalendarResponse } from "../Interfaces/EventResourceCalendarResponse";

// Match Backend.Models.Dto.EventDto
export interface EventDto {
  eventId: number;
  title: string;
  location: string;
  startDate: string;  // use string because DateTime from backend is ISO string
  endDate: string;
  imageUrl: string;
  parentEventId: number;
  description: string;
}

// Match Backend.Models.Dto.ActivityDto
export interface ActivityDtoInterface {
  activityId: number;
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  category: string; // Assuming EventCategory serializes as string
}

// The full backend response DTO
export interface EventsSubeventsActivitiesDto {
  eventsAndSubevents: EventDto[];
  activities: ActivityDtoInterface[];
}

// Your frontend models (can keep same shape but camelCase)
export interface Activity {
  id: number;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
}

export interface Subevent {
  id: number;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  activities: Activity[];
}

export function mapBackendResponse(
  backendData: EventsSubeventsActivitiesDto,
  mainEventId: number
): { subevents: Subevent[]; activities: Activity[] } {
  const subeventsDtos = backendData.eventsAndSubevents.filter(
    (e) => e.parentEventId === mainEventId
  );

  const mainEventActivities = backendData.activities
    .filter((a) => a.eventId === mainEventId)
    .map((a) => ({
      id: a.activityId,
      title: a.title,
      description: a.description,
      startDateTime: new Date(a.startDate),
      endDateTime: new Date(a.endDate),
    }));

  const subevents = subeventsDtos.map((sub) => ({
    id: sub.eventId,
    title: sub.title,
    description: sub.description,
    startDateTime: new Date(sub.startDate),
    endDateTime: new Date(sub.endDate),
    activities: backendData.activities
      .filter((a) => a.eventId === sub.eventId)
      .map((a) => ({
        id: a.activityId,
        title: a.title,
        description: a.description,
        startDateTime: new Date(a.startDate),
        endDateTime: new Date(a.endDate),
      })),
  }));

  return {
    subevents,
    activities: mainEventActivities,
  };
}


export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  [key: string]: any; // to avoid TS complaints for other fields
}

@Injectable({
    providedIn: "root"
})

export class ApiService{
    
    private apiUrl = 'https://localhost:7269/api';

    constructor(private http: HttpClient) {}

// services/api.service.ts

updateEventResourceStatus(eventResourceId: number, newStatus: number): Observable<string> {
    const url = `${this.apiUrl}/Supplier/eventresource/${eventResourceId}/status`;
    
    // Add responseType: 'text' to correctly parse the backend's response
    return this.http.put(url, newStatus, { responseType: 'text' });
}

    getPendingEventResources(supplierId: number): Observable<PendingRequest[]> {
    return this.http.get<PendingRequest[]>(`${this.apiUrl}/Supplier/supplier/${supplierId}/eventresources/pending`).pipe(
        catchError(this.handleError)
    );
    }

    deallocateResource(resourceId: number, eventId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Organizer/eventresource/deallocate/${resourceId}/${eventId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

    getEventResourcesForEvent(eventId: number): Observable<EventResourceDto[]> {
    return this.http.get<EventResourceApiResponse[]>(`${this.apiUrl}/Organizer/event/${eventId}/eventresources`)
        .pipe(
        map(dtos => dtos.map(dto => new EventResourceDto(
            dto.id ?? 0,
            dto.supplierID,
            dto.eventID,
            dto.resourceID,
            dto.quantity,
            dto.isReservable,
            dto.status,
            dto.startDateTimeBooked ? new Date(dto.startDateTimeBooked) : null,
            dto.endDateTimeBooked ? new Date(dto.endDateTimeBooked) : null
        ))),
        catchError(this.handleError)
        );
    }

requestResource(resourceDto: EventResourceDto): Observable<any> {
    return this.http.post<any>(
        `${this.apiUrl}/Organizer/eventresource/request`,
        resourceDto
    ).pipe(
        // Remove the map pipe, as the backend no longer returns a full DTO.
        catchError(this.handleError)
    );
}

    getResourcesBySupplierId(supplierId : number, eventId : number) : Observable<ResourceDto[]>
    {
        return this.http.get<ResourceApiResponse[]>(`${this.apiUrl}/Organizer/supplier/${supplierId}/resources?eventId=${eventId}`).pipe(
            map((response: ResourceApiResponse[]) =>
            response.map(response =>
                new ResourceDto(
                response.resourceID,
                response.name,
                response.category,
                response.isExhaustable,
                response.isAvailable,
                response.description,
                response.supplierID,
                response.quantity
                )
            )),

            catchError(error => this.handleError(error))
        );

        
    }

    getSuppliersForOrganizer() : Observable<SupplierDto[]>
    {
        return this.http.get<SupplierDtoResponse[]>(`${this.apiUrl}/Organizer/suppliers`).pipe(
            

            map((response: SupplierDtoResponse[]) =>
            response.map(response =>
                new SupplierDto(
                response.id,
                response.username,
                response.companyName,
                response.email,
                response.phoneNumber,
                response.website,
                response.companyBio,
                response.image
                )
            )),

        catchError(error => this.handleError(error))
        );
    }

    deleteResource(resourceId : number) : Observable<string>
    {
        return this.http.delete(`${this.apiUrl}/Supplier/resource/${resourceId}`, { responseType: 'text' }).pipe(
            catchError(error => this.handleError(error))
        )
    }

    editResource(editedResource: ResourceDto): Observable<string> {
    return this.http.put(
        `${this.apiUrl}/Supplier/resource/${editedResource.getResourceID()}`,
        editedResource,
        { responseType: 'text' }
    ).pipe(
        catchError(this.handleError)
    );
}


    addResource(resourceToAdd : ResourceDto) : Observable<ResourceDto>
    {
        return this.http.post<ResourceApiResponse>(`${this.apiUrl}/Supplier/resource`, resourceToAdd.toCreateRequestBody()).pipe(

            map((response : ResourceApiResponse) =>  new ResourceDto(
            response.resourceID,
            response.name,
            response.category,
            response.isExhaustable,
            response.isAvailable,
            response.description, // fixed spelling
            response.supplierID,
            response.quantity
            )),

            catchError(error => this.handleError(error))
        )
    }

    getResources(supplierId: number): Observable<ResourceDto[]> {
    const params = new HttpParams().set('supplierId', supplierId.toString());

    return this.http.get<ResourceApiResponse[]>(`${this.apiUrl}/Supplier/resources`, { params }).pipe(
        map((response: ResourceApiResponse[]) =>
        response.map(resource =>
            new ResourceDto(
            resource.resourceID,
            resource.name,
            resource.category,
            resource.isExhaustable,
            resource.isAvailable,
            resource.description, // fixed spelling
            resource.supplierID,
            resource.quantity
            )
        )
        ),
        catchError(error => this.handleError(error))
    );
    }


    getResourceAvailabilities(): Observable<ResourceAvailability[]> {
        return this.http.get<ResourceAvailability[]>(`${this.apiUrl}/Resource/availabilities`).pipe(
            catchError(this.handleError)
        );
    }

    getResourceCategories() : Observable<ResourceCategory[]>{

        return this.http.get<ResourceCategory[]>(`${this.apiUrl}/Resource/resource-categories`).pipe(
            catchError(this.handleError)
        )

    }

    searchLocations(query) : Observable<any[]>{
       return this.http.get<any[]>('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '5'
        }
      }).pipe(
        catchError(this.handleError)
      )
    }

    deleteMapPin(id : number): Observable<string>{
        return this.http.delete(`${this.apiUrl}/EventPin/${id}`, { responseType: 'text' }).pipe(
            catchError(this.handleError)
        )
    }

    updateMapPin(pin : EventPinDto) : Observable<string>{
        return this.http.put(`${this.apiUrl}/EventPin`, pin , {responseType: 'text'}).pipe(
            catchError(this.handleError)
        );
    }

    createMapPin(pinData : EventPinDto) : Observable<string>{
        return this.http.post(`${this.apiUrl}/EventPin`, pinData, { responseType: 'text' }).pipe(
            catchError(this.handleError)
        )
    }


    publishEvent(eventID)
    {
        return this.http.post<{ message: string }>(`${this.apiUrl}/Organizer/events/publish`, eventID ).pipe(
            catchError(this.handleError)
        )
    }

    cancelEvent(eventID)
    {
        return this.http.post<{ message: string }>(`${this.apiUrl}/Organizer/events/cancel`, eventID ).pipe(
            catchError(this.handleError)
        )
    }

    deleteEvent(eventID)
    {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/Organizer/events`,{ body:  eventID } ).pipe(
            catchError(this.handleError)
        )
    }
    getEventPins(eventId : number) : Observable<EventPinDto[]>{
        return this.http.get<EventPinApiResponse[]>(`${this.apiUrl}/EventPin/event?eventId=${eventId}`).pipe(

            map(response => response.map(
                pin => new EventPinDto(
                    pin.eventId,
                    pin.latitude,
                    pin.longitude,
                    pin.label,
                    new Date(pin.pinnedAt),
                    pin.pinCategory,
                    pin.description,
                    pin.id,
                )
            )),

            catchError(this.handleError)

        );
    }

    getPinCategories() : Observable<PinCategory[]>{

        return this.http.get<PinCategory[]>(`${this.apiUrl}/EventPin/categories`).pipe(
            catchError(this.handleError)
        )

    }

    deleteTicket(ticketId: number) : Observable<string>{
        return this.http.delete<{message: string}>(`${this.apiUrl}/Organizer/tickets`,{body: ticketId}).pipe(
            map(res => res.message),
            catchError(this.handleError)
        );
    }

    updateTicket(ticketDto : TicketDto):Observable<string>{
        return this.http.put<{message: string}>(`${this.apiUrl}/Organizer/tickets`, ticketDto).pipe(
            map(res => res.message),
            catchError(this.handleError)
        );
    }

    createTicket(ticketDto : TicketDto) : Observable<string>{

        return this.http.post<{message: string}>(`${this.apiUrl}/Organizer/tickets`, ticketDto).pipe(
            map(res => res.message),
            catchError(this.handleError)
        )
     
    }

    getTicketsForEvent(eventId : number): Observable<Ticket[]>{
        return this.http.get<TicketApiResponse[]>(`${this.apiUrl}/Organizer/tickets/${eventId}`).pipe(
            map(response => response.map(
                ticket => new Ticket(
                    ticket.ticketID,
                    ticket.eventID,
                    ticket.typeName,
                    ticket.description,
                    ticket.price,
                    ticket.quota,
                    new Date(ticket.validFrom),
                    new Date(ticket.validUntil)
                )
            )),

            catchError(this.handleError)
        )
    }

    geocodeAddress(address: string): Observable<GeocodingResult[]>{

        const encoded = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

        return this.http.get<GeocodingResult[]>(url).pipe(
            catchError(this.handleError)
        );

    }

    createActivity(activity : ActivityDto) : Observable<any>{
        return this.http.post<any>(
            `${this.apiUrl}/Organizer/activity`,
            activity,
            {observe: 'response'}
        );
    }

    getAgenda(eventId : number): Observable<{ subevents: Subevent[], activities: Activity[] }> {
        return this.http.get<EventsSubeventsActivitiesDto>(`${this.apiUrl}/Organizer/subevents-activities?eventId=${eventId}`).pipe(
            map(data => mapBackendResponse(data,eventId)),

            catchError(this.handleError)
        );
    }

    getEventBasicInfo(eventId : number) : Observable<EventBasicInfo>{
        return this.http.get<EventBasicInfoApiResponse>(`${this.apiUrl}/Events/BasicInfo/${eventId}`).pipe(

            map(data => {
                return new EventBasicInfo(
                    data.eventID,
                    data.title,
                    data.description,
                    data.location,
                    new Date(data.startDate),
                    new Date(data.endDate),
                    data.category,
                    data.capacity,
                    data.attendingCount,
                    data.imageUrl,
                    data.status,
                    data.parentEventId
                );
            }),
            
            catchError(this.handleError)
        );
    }

    changeEventPicture(formData : FormData) : Observable<{ imageUrl: string }>{
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/Events/change-event-picture`,formData).pipe(
            catchError(this.handleError)
        )
    }

    changeOrganizerPicture(formData : FormData){
        return this.http.post(`${this.apiUrl}/Organizer/change-organizer-picture`,formData).pipe(
            catchError(this.handleError)
        )
    }

    changeSupplierPicture(formData : FormData){
        return this.http.post(`${this.apiUrl}/Supplier/change-supplier-picture`,formData).pipe(
            catchError(this.handleError)
        )
    }

    updateEvent(data : UpdateEventDto) : Observable<EventApiResponse>{

        return this.http.put<EventApiResponse>(`${this.apiUrl}/Organizer/events`,data).pipe(
            catchError(this.handleError)
        )

    }

    createEvent(formData: FormData, organizerId: number): Observable<any> {
    return this.http.post(
        `${this.apiUrl}/Organizer/create-event/${organizerId}`,
        formData,
        {observe: 'response'}
    );
    }

    getEventCategories(): Observable<EventCategoryApiResponse[]>{
        return this.http.get<EventCategoryApiResponse[]>(`${this.apiUrl}/Events/categories`).pipe(
            catchError(this.handleError)
        );
    }


    getMonthlyMetrics(organizerId : number, year : number) : Observable<MonthlyMetrics[]>{
        return this.http.get<MonthlyMetrics[]>(`${this.apiUrl}/Organizer/monthly-stats?organizerId=${organizerId}&year=${year}`).pipe(
            catchError(this.handleError)
        );
    }



    getOrganizerEvents(organizerId : number) : Observable<Event[]> {
        return this.http.get<EventApiResponse[]>(`${this.apiUrl}/Organizer/events?id=${organizerId}`).pipe(
            map(data => 
                data.map(event => {
                    //console.log(data)
                    const organizer = event.organizer
                    ?  new User(
                        event.organizer.userId,
                        event.organizer.username,
                        event.organizer.email,
                        UserRoleMap[event.organizer.role] || 'Unknown',
                        new Date(event.organizer.creationTime),
                        event.organizer.isActive,
                        event.organizer.lastLoginTime ? new Date(event.organizer.lastLoginTime) : null,
                        event.organizer.password,
                        event.organizer.firstName,
                        event.organizer.lastName,
                        event.organizer.language,
                        event.organizer.phoneNumber,
                        event.organizer.profilePicture
                    ) : null
                    
                    return new Event(
                    event.eventID,
                    event.organizerID, 
                    event.title,
                    event.category,
                    event.description,
                    event.location,
                    new Date(event.startDate), 
                    new Date(event.endDate),   
                    event.numberOfPeople,      
                    organizer,
                    event.imageUrl,            
                    event.isFree,
                    event.status
                    );
                })
            ),
            catchError(this.handleError)
        );
    }

    getReusableResources(){
        return this.http.get<ResourceDto>(`${this.apiUrl}/Supplier/ReusableResources`).pipe(
            catchError(this.handleError)
        );
    }

    getUpcomingOrganizerEvents(organizerId : number) : Observable<Event[]> {
        return this.http.get<EventApiResponse[]>(`${this.apiUrl}/Organizer/upcoming-events?id=${organizerId}`).pipe(
            map(data => 
                data.map(event => {
                    //console.log(data)
                    const organizer = event.organizer
                    ?  new User(
                        event.organizer.userId,
                        event.organizer.username,
                        event.organizer.email,
                        UserRoleMap[event.organizer.role] || 'Unknown',
                        new Date(event.organizer.creationTime),
                        event.organizer.isActive,
                        event.organizer.lastLoginTime ? new Date(event.organizer.lastLoginTime) : null,
                        event.organizer.password,
                        event.organizer.firstName,
                        event.organizer.lastName,
                        event.organizer.language,
                        event.organizer.phoneNumber,
                        event.organizer.profilePicture
                    ) : null
                    
                    return new Event(
                    event.eventID,
                    event.organizerID, 
                    event.title,
                    event.category,
                    event.description,
                    event.location,
                    new Date(event.startDate), 
                    new Date(event.endDate),   
                    event.numberOfPeople,      
                    organizer,
                    event.imageUrl,            
                    event.isFree,
                    event.status
                    );
                })
            ),
            catchError(this.handleError)
        );
    }



    activateUser(userId: number, isActive: boolean = true) {
        return this.http.put(`${this.apiUrl}/Admin/users/${userId}/active?isActive=${isActive}`, {});
    }
    getDashboardMetrics() : Observable<DashboardMetrics>
    {
        return this.http.get<DashboardMetrics>(`${this.apiUrl}/Organizer/dashboard-metrics`).pipe(
            catchError(this.handleError)
        );
    }
    getStatusMetrics() : Observable<StatusMetrics>
    {
        return this.http.get<StatusMetrics>(`${this.apiUrl}/Organizer/event-status-stats`).pipe(
            catchError(this.handleError)
        );
    }
    getBookedResources() {
  return this.http.get<any[]>(`${this.apiUrl}/Supplier/booked-resources`).pipe(
    map(response =>
      response.map(dto =>
        new EventResourceCalendarResponse(
          new EventResourceDto(
          dto.eventResource.id,
          dto.eventResource.supplierID,
          dto.eventResource.eventID,
          dto.eventResource.resourceID,
          dto.eventResource.quantity,
          dto.eventResource.isReservable,
          dto.eventResource.status,
          dto.eventResource.startDateTimeBooked ? new Date(dto.eventResource.startDateTimeBooked) : null,
          dto.eventResource.endDateTimeBooked ? new Date(dto.eventResource.endDateTimeBooked) : null
        ), 
          dto.resourceName,
          dto.resourceCategory,
          dto.eventTitle,
          dto.resourceDescription,
          dto.eventStartDate ? new Date(dto.eventStartDate) : null,
          dto.eventEndDate ? new Date(dto.eventEndDate) : null
        )
      )
    ),
    catchError(this.handleError)
  );
}

    
    getCategoryMetrics() : Observable<CategoryMetrics>
    {
        return this.http.get<CategoryMetrics>(`${this.apiUrl}/Organizer/event-category-stats`).pipe(
            catchError(this.handleError)
        );
    }
    getAllUsers(): Observable<User[]>{
        return this.http.get<UserApiResponse[]>(`${this.apiUrl}/Admin/users`).pipe(
            
            map(data =>
                data.map(userResponse => new User(
                    userResponse.userId,
                    userResponse.username,
                    userResponse.email,
                    UserRoleMap[userResponse.role] || 'Unknown',
                    new Date(userResponse.creationTime),
                    userResponse.isActive,
                    userResponse.lastLoginTime ? new Date(userResponse.lastLoginTime) : null,
                    userResponse.password,
                    userResponse.firstName,
                    userResponse.lastName,
                    userResponse.language,
                    userResponse.phoneNumber,
                    userResponse.profilePicture
                ))
            )

        )
    }

    register(data : RegisterDto): Observable<UserDto>{

        return this.http.post<UserDtoResponse>(`${this.apiUrl}/User/register-web`, data).pipe(

            map(data => {
                //console.log('Raw backend response Register:', data);
                return new UserDto(
                data.userId,
                data.username,
                data.email,
                data.role,
                data.isActive
            );
        }),
            

            catchError(this.handleError)
        );
    }

    login(data : LoginDto): Observable<string>{
        return this.http.post<TokenResponse>(`${this.apiUrl}/User/login`,data).pipe(
            map(data => data.token),
            catchError(this.handleError)
        );
    }

    getOrganizer(orgId : number) : Observable<OrganizerDto>{
        return this.http.get<OrganizerDtoResponse>(`${this.apiUrl}/Organizer/get-organizer?id=${orgId}`).pipe(
            map(data => {
                return new OrganizerDto(
                    data.id,
                    data.name,
                    data.username,
                    data.email,
                    data.phoneNumber,
                    data.image
                )
            }),
            catchError(this.handleError)
        )
    }

    getSupplier() : Observable<SupplierDto>{
        return this.http.get<SupplierDtoResponse>(`${this.apiUrl}/Supplier/profile`).pipe(
            map(data => {
                return new SupplierDto(
                    data.id,
                    data.username,
                    data.companyName,
                    data.email,
                    data.phoneNumber,
                    data.website,
                    data.companyBio,
                    data.image
                )
            }),
            catchError(this.handleError)
        )
    }

    changeUserPass(data : ChangePasswordDto)
    {
        return this.http.put(`${this.apiUrl}/User/change-password`, data, { responseType: 'text' as const }).pipe(
  catchError(this.handleError)
);

    }



    updateOrg(data : OrganizerDto): Observable<string>{
        return this.http.post<SuccessfulMessageResponse>(`${this.apiUrl}/Organizer/update-organizer`,data).pipe(
            map(data => data.message),
            catchError(this.handleError)
        );
    }

    updateSupplier(data : UpdateSupplierDto): Observable<string>{
        return this.http.put<SuccessfulMessageResponse>(`${this.apiUrl}/Supplier/profile`,data).pipe(
            map(data => data.message),
            catchError(this.handleError)
        );
    }

    //Observable<never> means: "This observable will never emit a real value, and only exists to throw an error."
    handleError(errorResponse : HttpErrorResponse) : Observable<never>{

        //Fallback
        let errorMsg = 'An unknown error occurred!';

        //Client side error (e.g no internet, DNS failure, frontend bug)
        if(errorResponse.error instanceof ErrorEvent) {
            errorMsg = `Error: ${errorResponse.error.message}`;
        }
        else if (typeof errorResponse.error === 'string') {
            // Plain string message from backend
            errorMsg = errorResponse.error;
        }
        //If there is an error from backend and if that error has a message property use that
        else if (errorResponse.error && errorResponse.error.message){
            errorMsg = errorResponse.error.message;
        }
        //If there is no structured backend message this is a fallback that returns a status code with a generic message
        else{
            errorMsg = `Error Code: ${errorResponse.status}\n Message: ${errorResponse.message}`;
        }

        return throwError(()=> new Error(errorMsg))
    }
}