import { inject, Injectable } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";

@Injectable({
    providedIn: 'root'
})

export class ExitFormConformation{

    conformationService : ConfirmationService = inject(ConfirmationService);
    messageService : MessageService = inject(MessageService)

    confirmExit() : Promise<boolean>
    {
        return new Promise((resolve)=>{

        this.conformationService.confirm({

            message: 'Form fields are filled are you sure you want to navigate away?',
            header: 'Confirmation',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Yes',
            },
            accept: () => {
                resolve(true)
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Navigation Canceled!', life: 3000, });
            resolve(false)
            },
            });

        })
    }

}