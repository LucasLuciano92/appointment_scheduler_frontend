import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiClientService } from '../../../core/api/api-client.service';
import { apiErrorMessage } from '../../../core/api/api-error';
import { Service } from '../../../core/models/api.models';

@Component({
  selector: 'app-service-list',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss',
})
export class ServiceList {
  private readonly api = inject(ApiClientService);
  protected readonly services = signal<Service[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api
      .services()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ data }) => this.services.set(data),
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
  }
}
