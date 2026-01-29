export function printInvoice(invoice, storeName = "THE PETZOO STORE") {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert("Please allow popups to print invoices");
        return;
    }

    // Payment Type Logic
    let paymentLabel = 'Cash';
    if (invoice.paymentType === 'credit') paymentLabel = 'Udhar';
    else if (invoice.paymentType === 'partial') paymentLabel = 'Adha Udhar';
    else if (invoice.paymentType === 'cash') paymentLabel = 'Cash';

    const itemsHtml = invoice.items.map(item => `
    <tr class="item-row">
        <td class="item-name">
            ${item.name}
            <div class="item-meta">${item.unitLabel || 'Kg'} x ${item.qty}</div>
        </td>
        <td class="item-total">${(item.pricePerKg * item.totalKg).toLocaleString()}</td>
    </tr>
  `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice #${invoice.id}</title>
        <style>
            @page { margin: 0; }
            body { 
                font-family: 'Courier New', Courier, monospace; 
                width: 80mm; 
                margin: 0 auto; 
                padding: 10px; 
                background: #fff;
                color: #000;
            }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .logo { font-size: 22px; font-weight: 900; margin: 0; text-transform: uppercase; }
            .subtitle { font-size: 11px; margin-top: 2px; font-weight: bold; }
            .address { font-size: 10px; margin-top: 2px; }
            
            .info { width: 100%; font-size: 12px; margin-bottom: 5px; }
            .info td { padding: 2px 0; }
            .text-right { text-align: right; }
            
            table.items { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px; }
            th { border-bottom: 1px solid #000; text-align: left; padding: 5px 0; }
            .item-row td { padding: 5px 0; border-bottom: 1px dashed #ccc; }
            .item-name { font-weight: bold; }
            .item-meta { font-size: 10px; color: #555; font-weight: normal; }
            .item-total { text-align: right; vertical-align: top; }
            
            .totals { margin-top: 10px; border-top: 2px dashed #000; padding-top: 10px; font-size: 13px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .grand-total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 5px; margin-top: 5px; }
            
            .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px solid #ccc; padding-top: 10px; }
            .type-badge { text-align: center; font-weight: bold; font-size: 14px; margin: 10px 0; border: 1px solid #000; padding: 2px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1 class="logo">${storeName}</h1>
            <div class="address">R-07, Sector 10, North Karachi</div>
            <div class="subtitle">Best Quality Pet Feed & Grains</div>
            <div class="subtitle">Tel: 0321-3116118</div>
        </div>
        
        <table class="info">
            <tr>
                <td><strong>Inv #:</strong> ${invoice.id}</td>
                <td class="text-right"><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</td>
            </tr>
            <tr>
                <td><strong>Salesman:</strong> ${invoice.userName || 'Owner'}</td>
                <td class="text-right">${new Date(invoice.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
            </tr>
            ${invoice.customer.name ? `
            <tr>
                <td colspan="2" style="padding-top: 5px;"><strong>Customer:</strong> ${invoice.customer.name}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Phone:</strong> ${invoice.customer.phone}</td>
            </tr>
            ` : ''}
        </table>

        ${invoice.paymentType !== 'cash' ? `<div class="type-badge">TYPE: ${paymentLabel.toUpperCase()}</div>` : ''}

        <table class="items">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Total Amount:</span>
                <span>Rs ${invoice.total.toLocaleString()}</span>
            </div>
            <div class="totals-row">
                <span>Paid Received:</span>
                <span>Rs ${invoice.paid.toLocaleString()}</span>
            </div>
            ${invoice.remaining > 0 ? `
            <div class="totals-row" style="font-weight: bold; font-size: 14px; margin-top: 5px;">
                <span>Remaining Amount (Udhar):</span>
                <span>Rs ${invoice.remaining.toLocaleString()}</span>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>No Return - No Exchange</p>
            <p><strong>Thank you for visiting!</strong></p>
        </div>

        <script>
            window.onload = function() { window.print(); }
        </script>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
}
