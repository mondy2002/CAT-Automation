import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class UploadsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly uploadCard: Locator;
  readonly dropZone: Locator;
  readonly filterBar: Locator;
  readonly searchInput: Locator;
  readonly filterChips: Locator;
  readonly allChip: Locator;
  readonly pdfChip: Locator;
  readonly wordChip: Locator;
  readonly excelChip: Locator;
  readonly pptChip: Locator;
  readonly imagesChip: Locator;
  readonly fileCount: Locator;
  readonly pageSizeButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = this.locator('.pg-title');
    this.pageSubtitle = this.locator('.pg-subtitle');
    this.uploadCard = this.locator('.upload-card');
    this.dropZone = this.locator('.drop-zone');
    this.filterBar = this.locator('.ul-filter-bar');
    this.searchInput = this.locator('.fb-search-input');
    this.filterChips = this.locator('.fb-chip');
    this.allChip = this.locator('.fb-chip--teal');
    this.pdfChip = this.locator('.fb-chip--red');
    this.wordChip = this.locator('.fb-chip--blue');
    this.excelChip = this.locator('.fb-chip--green');
    this.pptChip = this.locator('.fb-chip--orange');
    this.imagesChip = this.locator('.fb-chip--purple');
    this.fileCount = this.locator('.fb-count');
    this.pageSizeButton = this.locator('.fb-pagesize-btn');
    this.emptyState = this.locator('.ul-empty');
  }

  async goto(): Promise<void> {
    await this.navigate('/uploads');
    await this.filterBar.waitFor({ state: 'visible', timeout: 15000 });
  }

  async isDropZoneVisible(): Promise<boolean> {
    return this.dropZone.isVisible();
  }

  async isEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  async getActiveChipText(): Promise<string> {
    return (await this.locator('.fb-chip.active').textContent())?.trim() ?? '';
  }

  async getFileCount(): Promise<string> {
    return (await this.fileCount.textContent())?.trim() ?? '';
  }

  async clickFilterChip(type: 'all' | 'pdf' | 'word' | 'excel' | 'ppt' | 'images'): Promise<void> {
    const map: Record<string, Locator> = {
      all: this.allChip,
      pdf: this.pdfChip,
      word: this.wordChip,
      excel: this.excelChip,
      ppt: this.pptChip,
      images: this.imagesChip,
    };
    await map[type].click();
    await this.page.waitForTimeout(400);
  }

  async searchFiles(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async getChipCount(): Promise<number> {
    return this.filterChips.count();
  }
}
