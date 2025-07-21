import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
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
import { CategoryMap, Event } from "../Models/Event";


@Injectable({
    providedIn: "root"
})
export class ApiService{
    
    private apiUrl = 'https://localhost:7269/api';

    constructor(private http: HttpClient) {}

    createEvent(formData: FormData, organizerId: number): Observable<any> {
    return this.http.post(
        `${this.apiUrl}/Organizer/create-event/${organizerId}`,
        formData,
        {observe: 'response'}
    );
    }

    getOrganizerEvents(organizerId : number) : Observable<Event[]> {
        return this.http.get<EventApiResponse[]>(`${this.apiUrl}/Organizer/events?id=${organizerId}`).pipe(
            map(data => 
                data.map(event => {
                    console.log(data)
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
                    CategoryMap[event.category] || 'Unknown',
                    event.description,
                    event.location,
                    new Date(event.startDate), 
                    new Date(event.endDate),   
                    event.numberOfPeople,      
                    organizer,
                    event.imageUrl,            
                    event.isFree
                    );
                })
            ),
            catchError(this.handleError)
        );
    }

    activateUser(userId: number, isActive: boolean = true) {
        return this.http.put(`${this.apiUrl}/Admin/users/${userId}/active?isActive=${isActive}`, {});
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

        return this.http.post<UserDtoResponse>(`${this.apiUrl}/User/register`, data).pipe(

            map(data => {
                console.log('Raw backend response Register:', data);
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

    updateOrg(data : OrganizerDto, newP : string): Observable<string>{
        return this.http.post<SuccessfulMessageResponse>(`${this.apiUrl}/Organizer/update-organizer?newPassword=${newP}`,data).pipe(
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




    // getUsersPaginated(start: number, count: number): Observable<User[]>{
    //     return this.http.get<UserApiResponse[]>(`${this.apiUrl}/Admin/users/page?k=${start}&n=${count}`).pipe(

    //         map( data =>
    //             data.map(userResponse => new User(
    //                 userResponse.userId,
    //                 userResponse.username,
    //                 userResponse.email,
    //                 UserRoleMap[userResponse.role] || 'Unknown',
    //                 new Date(userResponse.creationTime),
    //                 userResponse.isActive,
    //                 userResponse.lastLoginTime ? new Date(userResponse.lastLoginTime) : null,
    //                 userResponse.password,
    //                 userResponse.firstName,
    //                 userResponse.lastName
    //             ))
    //         )

    //     )
    // }