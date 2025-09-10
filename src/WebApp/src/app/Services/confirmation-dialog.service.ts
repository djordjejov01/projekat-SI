import { inject, Injectable } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogService {

    confirmationService: ConfirmationService = inject(ConfirmationService);
    messageService: MessageService = inject(MessageService);
    translate: TranslateService = inject(TranslateService);

    confirm(message: string, header: string = 'CONFIRMATION'): Promise<boolean> {
        return new Promise((resolve) => {

            this.confirmationService.confirm({
                message: message,
                header: this.translate.instant(header),
                closable: true,
                closeOnEscape: true,
                icon: 'pi pi-exclamation-triangle',
                rejectButtonProps: {
                    label: this.translate.instant('CANCEL'),
                    severity: 'secondary',
                    outlined: true,
                },
                acceptButtonProps: {
                    label: this.translate.instant('YES'),
                },
                accept: () => {
                    resolve(true);
                },
                reject: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: this.translate.instant('CANCELLED'),
                        detail: this.translate.instant('ACTION_CANCELLED'),
                        life: 3000,
                    });
                    resolve(false);
                },
            });

        });
    }

}
