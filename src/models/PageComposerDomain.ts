import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Dominio personalizado conectado a un sitio publicado.
 *
 * Guarda hostname, proveedor, identificadores del proveedor, estado de
 * verificación y de SSL, marcas de tiempo e instrucciones DNS. Un dominio no se
 * considera `active` hasta que el proveedor confirma la verificación.
 */

export type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed' | 'disabled';

export interface IPageComposerDomain extends Document {
  siteId: Types.ObjectId;
  hostname: string;
  provider: string;
  providerHostnameId?: string | null;
  status: DomainStatus;
  verification: {
    status: 'pending' | 'active' | 'failed' | 'error';
    verifiedAt?: Date | null;
    lastCheckedAt?: Date | null;
    error?: string | null;
  };
  ssl: {
    status: 'pending' | 'provisioning' | 'active' | 'failed' | 'error';
    error?: string | null;
  };
  dns?: { host: string; recordType: 'CNAME' | 'TXT'; target: string } | null;
  isCanonical: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PageComposerDomainSchema = new Schema<IPageComposerDomain>(
  {
    siteId: { type: Schema.Types.ObjectId, required: true, index: true },
    hostname: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    providerHostnameId: { type: String, default: null },
    status: { type: String, enum: ['pending', 'verifying', 'active', 'failed', 'disabled'], default: 'pending' },
    verification: {
      status: { type: String, enum: ['pending', 'active', 'failed', 'error'], default: 'pending' },
      verifiedAt: { type: Date, default: null },
      lastCheckedAt: { type: Date, default: null },
      error: { type: String, default: null },
    },
    ssl: {
      status: { type: String, enum: ['pending', 'provisioning', 'active', 'failed', 'error'], default: 'pending' },
      error: { type: String, default: null },
    },
    dns: {
      host: { type: String },
      recordType: { type: String, enum: ['CNAME', 'TXT'] },
      target: { type: String },
    },
    isCanonical: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

PageComposerDomainSchema.index({ siteId: 1, hostname: 1 }, { unique: true });
PageComposerDomainSchema.index({ hostname: 1 }, { unique: true });

export default mongoose.models.PageComposerDomain ||
  mongoose.model<IPageComposerDomain>('PageComposerDomain', PageComposerDomainSchema, 'page_composer_domains');