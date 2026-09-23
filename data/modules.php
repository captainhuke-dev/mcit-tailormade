<?php
/**
 * ข้อมูลโมดูลและโปรแกรมของ ERP Portal
 * แหล่งที่มา: menu_map.txt (แผนโครงสร้างเมนูระบบ)
 * โครงสร้าง: module -> groups[] -> programs[]
 *
 * program field:
 *   id       -> รหัส Pxxx (ใช้ระบุโปรแกรม)
 *   name     -> ชื่อโปรแกรม
 *   type     -> "link" = เปิดโปรแกรมเดิม (มี ↗)
 *   badge    -> label แสดงบนการ์ด เช่น "Status", "Manual"
 */
return [
    [
        "id"    => "master",
        "name"  => "Master",
        "icon"  => "▣",
        "groups" => [
            [
                "id"          => "master-data",
                "name"        => "ข้อมูลหลัก",
                "description" => "จัดการข้อมูลหลักของระบบ",
                "programs"   => [
                    ["id" => "P001", "name" => "Master Item"],
                    ["id" => "P002", "name" => "Master Customer"],
                    ["id" => "P003", "name" => "Master Sync Data"],
                ],
            ],
        ],
    ],
    [
        "id"    => "accounting",
        "name"  => "บัญชี",
        "icon"  => "▤",
        "groups" => [
            [
                "id"          => "print-document",
                "name"        => "พิมพ์เอกสาร",
                "description" => "พิมพ์เอกสารสำหรับงานบัญชี",
                "programs"   => [
                    ["id" => "P004", "name" => "ใบปะหน้าเก็บบัญชี (พาราเทค)"],
                    ["id" => "P005", "name" => "ใบปะหน้าเก็บบัญชีห้าง"],
                    ["id" => "P006", "name" => "Print Invoice เช็คคืน"],
                    ["id" => "P007", "name" => "ใบปะหน้าเก็บบัญชี VAT, No VAT"],
                    ["id" => "P008", "name" => "ใบปะหน้าเก็บบัญชี VAT, No VAT V2"],
                    ["id" => "P009", "name" => "ใบปะหน้าเก็บบัญชี VAT, No VAT V2-BKK"],
                    ["id" => "P010", "name" => "ใบปะหน้าเก็บบัญชี (ไทยเกษตร)"],
                ],
            ],
            [
                "id"          => "accounts-receivable",
                "name"        => "ลูกหนี้",
                "description" => "ตรวจสอบและจัดการข้อมูลลูกหนี้",
                "programs"   => [
                    ["id" => "P011", "name" => "ตรวจสอบ Sale - เช็คกับใบเสร็จ"],
                    ["id" => "P012", "name" => "ตรวจสอบลูกค้าใหม่"],
                    ["id" => "P013", "name" => "ใบอนุมัติวงเงินและปรับวงเงิน", "status" => "ready"],
                    ["id" => "P014", "name" => "รายงาน Commission Stock"],
                    ["id" => "P015", "name" => "สถานะบิลค้างรับ"],
                    ["id" => "P016", "name" => "ตรวจสอบส่วนลดการจ่าย"],
                    ["id" => "P017", "name" => "บิลเงินสดที่ยังไม่รับเงิน"],
                    ["id" => "P018", "name" => "รับบิลที่ส่งของแล้ว", "badge" => "Status"],
                    ["id" => "P019", "name" => "เช็คสถานะส่ง Invoice"],
                    ["id" => "P020", "name" => "Update Payment MarketPlace"],
                    ["id" => "P021", "name" => "ตรวจสอบ Payment MarketPlace"],
                    ["id" => "P022", "name" => "View Billing Document", "status" => "ready"],
                    ["id" => "P023", "name" => "ตรวจสอบ Performance การเก็บบัญชี"],
                    ["id" => "P024", "name" => "ตรวจสอบมูลหนี้เฝ้าระวัง"],
                    ["id" => "P025", "name" => "ตรวจสอบบิลเกิน due"],
                ],
            ],
            [
                "id"          => "accounts-payable",
                "name"        => "เจ้าหนี้",
                "description" => "ประวัติทางการเงินของเจ้าหนี้",
                "programs"   => [
                    ["id" => "P026", "name" => "ประวัติการเงินเจ้าหนี้"],
                ],
            ],
            [
                "id"          => "check",
                "name"        => "เช็ค",
                "description" => "ตรวจสอบเช็คและเลขที่เช็ค",
                "programs"   => [
                    ["id" => "P027", "name" => "ตรวจสอบเช็ค"],
                    ["id" => "P028", "name" => "ตรวจสอบเลขที่เช็คซ้ำ"],
                ],
            ],
            [
                "id"          => "general",
                "name"        => "ทั่วไป",
                "description" => "เครื่องมือทั่วไปสำหรับงานบัญชี",
                "programs"   => [
                    ["id" => "P029", "name" => "เปลี่ยนแผนกค่าใช้จ่าย"],
                    ["id" => "P030", "name" => "เปลี่ยนแผนกค่าใช้จ่าย (เก่า)"],
                ],
            ],
            [
                "id"          => "credit",
                "name"        => "สินเชื่อ",
                "description" => "รายงานและตรวจสอบวงเงินลูกค้า",
                "programs"   => [
                    ["id" => "P031", "name" => "รายงานเงินโอนประจำวัน", "status" => "ready"],
                    ["id" => "P032", "name" => "รายงานเงินมัดจำประจำวัน", "status" => "ready"],
                    ["id" => "P033", "name" => "รายงานลูกค้าที่มียอดค้างเกินวงเงิน", "status" => "ready"],
                    ["id" => "P034", "name" => "ประวัติทางการเงินลูกหนี้", "status" => "ready"],
                    ["id" => "P035", "name" => "ตรวจสอบลูกค้าติดอนุมัติ", "status" => "ready"],
                    ["id" => "P036", "name" => "รับบิลจากบัญชี", "badge" => "Status"],
                ],
            ],
        ],
    ],
    [
        "id"    => "admin",
        "name"  => "ธุรการ",
        "icon"  => "▤",
        "groups" => [
            [
                "id"          => "data-check",
                "name"        => "ตรวจสอบข้อมูล",
                "description" => "ตรวจสอบความถูกต้องของเอกสาร การส่ง และข้อมูลสินค้า",
                "programs"   => [
                    ["id" => "P037", "name" => "ตรวจสอบของจองที่มีการเปิดบิล"],
                    ["id" => "P038", "name" => "ตรวจสอบค้างส่งผลักดันสินค้า"],
                    ["id" => "P039", "name" => "ตรวจสอบตัดของเกิน SO"],
                    ["id" => "P040", "name" => "ตรวจสอบค้างส่งสินค้า LOT"],
                    ["id" => "P041", "name" => "ตรวจสอบสินค้าจองที่ไม่อ้างอิง SO"],
                    ["id" => "P042", "name" => "ตรวจสอบเลขที่ขนส่ง"],
                    ["id" => "P043", "name" => "ตรวจสอบลูกค้าติดอนุมัติ ADS"],
                    ["id" => "P044", "name" => "ตรวจสอบเลขบิลซ้ำ (MH,HP)"],
                    ["id" => "P045", "name" => "ตรวจสอบบิลลูกค้าเดียวกัน"],
                    ["id" => "P046", "name" => "ตรวจสอบ Pack Master"],
                    ["id" => "P047", "name" => "เช็คสถานะ Invoice"],
                    ["id" => "P048", "name" => "UPDATE ที่อยู่ขนส่ง"],
                    ["id" => "P049", "name" => "Check TMS"],
                ],
            ],
            [
                "id"          => "print-document",
                "name"        => "พิมพ์เอกสาร",
                "description" => "พิมพ์ใบวางบิลและเอกสารประกอบ",
                "programs"   => [
                    ["id" => "P050", "name" => "ใบวางบิล", "status" => "ready"],
                    ["id" => "P013", "name" => "ใบอนุมัติวงเงินและปรับวงเงิน", "type" => "link", "status" => "ready"],
                    ["id" => "P034", "name" => "ประวัติทางการเงินลูกหนี้", "type" => "link", "status" => "ready"],
                    ["id" => "P051", "name" => "รายงานการเก็บเงินสด"],
                    ["id" => "P052", "name" => "สติ๊กเกอร์ 10x10 (ใบปะ)"],
                    ["id" => "P053", "name" => "สติ๊กเกอร์ 10x7.5 (ใบปะ)", "status" => "ready"],
                    ["id" => "P054", "name" => "Packing Order/Cartonize/ใบจัดกล่อง"],
                ],
            ],
            [
                "id"          => "configuration",
                "name"        => "กำหนดค่า",
                "description" => "ตั้งค่า ปลดล็อก และจัดการสถานะเอกสาร",
                "programs"   => [
                    ["id" => "P055", "name" => "ปลด Lock วันที่คีย์เอกสาร"],
                    ["id" => "P056", "name" => "ปลด Lock ชั่วคราว (แก้ Grade X)"],
                    ["id" => "P057", "name" => "ใส่ Packing Invoice (เปลี่ยนสถานะ)"],
                    ["id" => "P058", "name" => "ใส่ Packing Invoice (ไม่เปลี่ยนสถานะ)"],
                    ["id" => "P059", "name" => "จัดเก็บเอกสารลูกค้า"],
                    ["id" => "P060", "name" => "ส่งบิลให้สโตร์", "badge" => "Status"],
                    ["id" => "P061", "name" => "ส่งบิลไป WMS"],
                    ["id" => "P062", "name" => "ส่งบิลไป WMS V2"],
                ],
            ],
            [
                "id"          => "print-invoice",
                "name"        => "Print Invoice",
                "description" => "พิมพ์ Invoice แยกตามช่องทางขาย",
                "programs"   => [
                    ["id" => "P063", "name" => "KTV", "status" => "ready"],
                    ["id" => "P064", "name" => "MCIT", "status" => "ready"],
                    ["id" => "P065", "name" => "MCA"],
                    ["id" => "P066", "name" => "ขายปลีก"],
                    ["id" => "P067", "name" => "ห้าง"],
                    ["id" => "P068", "name" => "AGN,AGV"],
                    ["id" => "P069", "name" => "Drop Ship"],
                    ["id" => "P070", "name" => "FAN,FAV"],
                    ["id" => "P071", "name" => "พิเศษ"],
                    ["id" => "P072", "name" => "รับเอง"],
                    ["id" => "P073", "name" => "สำหรับแจ้งความ"],
                    ["id" => "P074", "name" => "MarketPlace"],
                    ["id" => "P075", "name" => "TKS (ไทยเกษตร)"],
                ],
            ],
            [
                "id"          => "print-invoice-bkk",
                "name"        => "Print Invoice BKK",
                "description" => "พิมพ์ Invoice สาขากทม.",
                "programs"   => [
                    ["id" => "P063", "name" => "KTV"],
                    ["id" => "P064", "name" => "MCIT", "status" => "ready"],
                    ["id" => "P069", "name" => "Drop Ship"],
                    ["id" => "P072", "name" => "รับเอง"],
                ],
            ],
            [
                "id"          => "picklist-trade",
                "name"        => "PickList (Trade)",
                "description" => "PickList สำหรับงาน Trade",
                "programs"   => [
                    ["id" => "P076", "name" => "PickList ห้าง"],
                    ["id" => "P077", "name" => "PickList EM"],
                    ["id" => "P078", "name" => "PickList By INV"],
                    ["id" => "P079", "name" => "PickList Marketplace"],
                    ["id" => "P080", "name" => "PickList QC"],
                    ["id" => "P081", "name" => "PickList By Route"],
                    ["id" => "P082", "name" => "PickList To Pack"],
                    ["id" => "P083", "name" => "PickList To Load V2"],
                ],
            ],
            [
                "id"          => "picklist-pd-qc",
                "name"        => "PickList (PD/QC)",
                "description" => "PickList สำหรับ PD/QC",
                "programs"   => [
                    ["id" => "P084", "name" => "PickList[IRW][Zone QC]"],
                ],
            ],
        ],
    ],
    [
        "id"    => "marketing",
        "name"  => "การตลาด",
        "icon"  => "◉",
        "groups" => [
            [
                "id"          => "marketing-programs",
                "name"        => "รายการระดับการตลาด",
                "description" => "เครื่องมือสำหรับงานการตลาดและจัดการสินค้า",
                "programs"   => [
                    ["id" => "P085", "name" => "เปรียบเทียบสินค้า"],
                    ["id" => "P086", "name" => "ตรวจสอบ Stock Lazada"],
                    ["id" => "P001", "name" => "Master Item V3"],
                    ["id" => "P087", "name" => "ควบคุม Catalog"],
                    ["id" => "P088", "name" => "ส่ง Catalog ให้ลูกค้า"],
                    ["id" => "P089", "name" => "ชื่อเล่นสินค้า"],
                    ["id" => "P090", "name" => "Mail โฆษณา"],
                    ["id" => "P091", "name" => "ตั้งราคาซื้อ-ขายสินค้า"],
                    ["id" => "P092", "name" => "พิมพ์ Barcode/สคบ."],
                ],
            ],
        ],
    ],
    [
        "id"    => "purchasing",
        "name"  => "จัดซื้อ",
        "icon"  => "🛒",
        "groups" => [
            [
                "id"          => "po-document",
                "name"        => "พิมพ์เอกสาร",
                "description" => "เอกสาร PO และอนุมัติ",
                "programs"   => [
                    ["id" => "P093", "name" => "ใบอนุมัติ PO"],
                    ["id" => "P094", "name" => "PO Dropship"],
                    ["id" => "P095", "name" => "PO Dropship เปลี่ยนชื่อ"],
                ],
            ],
            [
                "id"          => "price-config",
                "name"        => "Price Config",
                "description" => "ตั้งราคาขายสินค้า",
                "programs"   => [
                    ["id" => "P096", "name" => "ตั้งราคาขายสินค้า", "badge" => "Manual"],
                    ["id" => "P091", "name" => "ตั้งราคาซื้อ-ขายสินค้า", "badge" => "MAC-Odoo"],
                ],
            ],
            [
                "id"          => "purchasing-programs",
                "name"        => "รายการระดับจัดซื้อ",
                "description" => "เครื่องมือวิเคราะห์และติดตามงานจัดซื้อ",
                "programs"   => [
                    ["id" => "P097", "name" => "อัพเดทราคาผ้าฟาง V2"],
                    ["id" => "P098", "name" => "ระวังหลังจัดซื้อ"],
                    ["id" => "P099", "name" => "ตรวจสอบสินค้าค้างส่งที่ราคาต่างกัน"],
                    ["id" => "P100", "name" => "ประเมินคำสั่งซื้อ (Forecast) V2"],
                    ["id" => "P101", "name" => "ตรวจสอบสินค้าทดแทน"],
                    ["id" => "P102", "name" => "List รายการค้างรับ - ตาม Supplier"],
                    ["id" => "P103", "name" => "ตรวจสอบต้นทุนปัจจุบัน vs นำเข้า+ค่าขนส่ง"],
                    ["id" => "P104", "name" => "Price Margin Analytic"],
                    ["id" => "P105", "name" => "ตรวจสอบสถานะสินค้า V2"],
                    ["id" => "P106", "name" => "Print Barcode", "status" => "ready"],
                    ["id" => "P107", "name" => "ตรวจสอบค้างรับสินค้า LOT (PO)"],
                    ["id" => "P108", "name" => "ตรวจสอบค้างส่งสินค้า LOT (SO)"],
                ],
            ],
        ],
    ],
    [
        "id"    => "sales",
        "name"  => "ฝ่ายขาย",
        "icon"  => "♟",
        "groups" => [
            [
                "id"          => "sales-programs",
                "name"        => "รายการระดับฝ่ายขาย",
                "description" => "เครื่องมือสนับสนุนการขายและติดตามคำสั่งซื้อ",
                "programs"   => [
                    ["id" => "P109", "name" => "ตรวจสอบ SO มัดจำเกินเวลา"],
                    ["id" => "P038", "name" => "ตรวจสอบค้างส่งผลักดันสินค้า"],
                    ["id" => "P041", "name" => "ตรวจสอบสินค้าจองที่ไม่อ้างอิง SO"],
                    ["id" => "P110", "name" => "ระบบจัดการขนส่งคลังสินค้า"],
                    ["id" => "P088", "name" => "ส่ง Catalog ให้ลูกค้า"],
                    ["id" => "P099", "name" => "ตรวจสอบสินค้าค้างส่งที่ราคาต่างกัน"],
                    ["id" => "P059", "name" => "จัดเก็บเอกสารลูกค้า"],
                    ["id" => "P111", "name" => "เปลี่ยนสถานะ SO รอโอน", "status" => "ready"],
                    ["id" => "P112", "name" => "หาขนส่งให้ลูกค้า"],
                    ["id" => "P105", "name" => "ตรวจสอบสถานะสินค้า V2"],
                    ["id" => "P113", "name" => "Barcode Mr.DIY"],
                    ["id" => "P114", "name" => "Price List ฝ่ายขาย"],
                    ["id" => "P115", "name" => "TMS View Picture (ฝ่ายขาย)", "status" => "ready"],
                ],
            ],
        ],
    ],
    [
        "id"    => "scm",
        "name"  => "SCM",
        "icon"  => "⚙",
        "groups" => [
            [
                "id"          => "scm-programs",
                "name"        => "รายการระดับ SCM",
                "description" => "จัดการห่วงโซ่อุปทานและค้างส่ง",
                "programs"   => [
                    ["id" => "P038", "name" => "ตรวจสอบค้างส่งผลักดันสินค้า"],
                    ["id" => "P116", "name" => "ตรวจสอบค้างส่งของลูกค้าที่สั่งสินค้าซ้ำกัน"],
                    ["id" => "P040", "name" => "ตรวจสอบค้างส่งสินค้า LOT"],
                    ["id" => "P117", "name" => "จัดคิวค้างส่ง"],
                    ["id" => "P118", "name" => "สินค้าทดแทน"],
                ],
            ],
        ],
    ],
    [
        "id"    => "warehouse",
        "name"  => "คลังสินค้า",
        "icon"  => "▰",
        "groups" => [
            [
                "id"          => "warehouse-print",
                "name"        => "พิมพ์เอกสาร",
                "description" => "พิมพ์ Barcode สำหรับงานคลัง",
                "programs"   => [
                    ["id" => "P092", "name" => "พิมพ์ Barcode/สคบ."],
                    ["id" => "P119", "name" => "พิมพ์ Barcode/สคบ. จาก PO"],
                ],
            ],
            [
                "id"          => "warehouse-programs",
                "name"        => "รายการระดับคลังสินค้า",
                "description" => "เครื่องมือสำหรับการจัดการคลังสินค้า",
                "programs"   => [
                    ["id" => "P110", "name" => "ระบบจัดการขนส่งคลังสินค้า"],
                    ["id" => "P120", "name" => "ตรวจสอบ Supplier ส่งของ"],
                    ["id" => "P121", "name" => "เปิดบันทึก Video ซ้ำ"],
                    ["id" => "P122", "name" => "STK Dimension"],
                    ["id" => "P123", "name" => "รับบิลจากธุรการ", "badge" => "Status"],
                    ["id" => "P124", "name" => "เช็คค้างส่งจากการรับของ"],
                ],
            ],
        ],
    ],
    [
        "id"    => "delivery",
        "name"  => "จัดส่ง",
        "icon"  => "▸",
        "groups" => [
            [
                "id"          => "delivery-programs",
                "name"        => "รายการระดับจัดส่ง",
                "description" => "เครื่องมือควบคุมและติดตามการจัดส่งสินค้า",
                "programs"   => [
                    ["id" => "P110", "name" => "ระบบจัดการขนส่งคลังสินค้า"],
                    ["id" => "P125", "name" => "Update การจัดส่ง", "badge" => "Status"],
                    ["id" => "P126", "name" => "สร้างเส้นทางบริษัทขนส่ง"],
                    ["id" => "P128", "name" => "TMS View Picture (จัดส่ง)", "status" => "ready"],
                ],
            ],
        ],
    ],
    [
        "id"    => "moderntrade",
        "name"  => "Moderntrade",
        "icon"  => "◈",
        "groups" => [
            [
                "id"          => "mt-print",
                "name"        => "พิมพ์เอกสาร",
                "description" => "พิมพ์ Barcode สำหรับ Moderntrade",
                "programs"   => [
                    ["id" => "P127", "name" => "Barcode ห้าง"],
                ],
            ],
            [
                "id"          => "mt-programs",
                "name"        => "รายการระดับ Moderntrade",
                "description" => "เครื่องมือสำหรับงาน Moderntrade",
                "programs"   => [
                    ["id" => "P044", "name" => "ตรวจสอบเลขบิลซ้ำ (MH,HP,MKP)"],
                ],
            ],
        ],
    ],
];
