import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './AdminCalendarPage.module.css';

import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminCalendarPage = () => {
    const [events, setEvents] = useState([]);
    const token = localStorage.getItem('accessToken');

    const fetchData = async (start, end) => {
        try {

            const slotsRes = await fetch(
                `http://localhost:8080/api/slots?from=${start.toISOString()}&to=${end.toISOString()}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );


            let slotsData = slotsRes.ok ? await slotsRes.json() : [];
            if (!slotsRes.ok) {
                const fallbackRes = await fetch(
                    `http://localhost:8080/api/slots/available?from=${start.toISOString()}&to=${end.toISOString()}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                slotsData = await fallbackRes.json();
            }

            const reservationsRes = await fetch(
                `http://localhost:8080/api/reservations`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const reservationsData = await reservationsRes.json();

            const activeReservations = reservationsData.filter(res => res.status !== 'CANCELLED');


            const existingSlotIds = new Set(slotsData.map(s => s.id));
            const virtualSlots = [];

            activeReservations.forEach(res => {

                const slotId = res.slotId || res.availabilitySlot?.id || res.slot?.id;

                if (slotId && !existingSlotIds.has(slotId)) {
                    existingSlotIds.add(slotId);
                    virtualSlots.push({
                        id: slotId,
                        startTime: res.startTime,
                        endTime: res.endTime,
                        level: res.level || res.lessonOffer?.level || '',
                        lessonType: res.lessonType || res.lessonOffer?.lessonType || 'INDIVIDUAL',
                        capacity: 1,
                        isReserved: true
                    });
                }
            });


            const allSlotsToRender = [...slotsData, ...virtualSlots];


            const calendarEvents = allSlotsToRender.map(slot => {
                const slotTypeNorm = slot.lessonType ? slot.lessonType.toString().toLowerCase() : '';
                const isGroup = slotTypeNorm.includes('group') || slotTypeNorm.includes('grup');
                const maxCapacity = slot.capacity || (isGroup ? 5 : 1);


                const matchingReservations = activeReservations.filter(res => {
                    const resSlotId = res.slotId || res.availabilitySlot?.id || res.slot?.id;
                    return resSlotId === slot.id || (
                        new Date(res.startTime).getTime() === new Date(slot.startTime).getTime() &&
                        new Date(res.endTime).getTime() === new Date(slot.endTime).getTime()
                    );
                });

                const bookingsCount = matchingReservations.length;
                const isFull = bookingsCount >= maxCapacity || slot.isReserved;


                const slotDesc = slot.description ? `\n📌 ${slot.description}` : '';

                let bgBtnColor = '#2ecc71';
                let statusTitle = `WOLNY (${slot.level || ''} - ${isGroup ? 'Grupowe' : 'Indyw.'})${slotDesc}`;

                if (bookingsCount > 0 && !isFull) {
                    bgBtnColor = '#f39c12';
                    statusTitle = `GRUPA (${bookingsCount}/${maxCapacity})${slotDesc}\nOsoby: ${matchingReservations.map(r => r.studentName || r.student?.fullName).join(', ')}`;
                } else if (isFull || bookingsCount > 0) {
                    bgBtnColor = '#d28b5b';
                    const namesList = matchingReservations.map(r => r.studentName || r.student?.fullName).filter(Boolean).join(', ');
                    statusTitle = isGroup
                        ? `KOMPLET (${bookingsCount}/${maxCapacity})${slotDesc}\nOsoby: ${namesList}`
                        : `ZAREZERWOWANE${slotDesc}\nUczeń: ${namesList || 'Uczeń'}`;
                }

                return {
                    id: slot.id,
                    start: slot.startTime,
                    end: slot.endTime,
                    title: statusTitle,
                    backgroundColor: bgBtnColor,
                    textColor: '#ffffff',
                    extendedProps: {
                        description: slot.description,
                        type: 'SLOT_WITH_RESERVATIONS',
                        slotId: slot.id,
                        level: slot.level,
                        lessonType: slot.lessonType,
                        isGroup,
                        maxCapacity,
                        bookingsCount,
                        reservations: matchingReservations
                    }
                };
            });

            setEvents(calendarEvents);
        } catch (error) {
            console.error("Błąd kalendarza:", error);
            toast.error("Błąd pobierania danych kalendarza");
        }
    };

    const handleSelect = async (selectInfo) => {
        let selectedLevel = 'Podstawowy';
        let selectedType = 'INDIVIDUAL';

        const { value: formValues } = await Swal.fire({
            title: '<span style="color: #2c3e50; font-size: 1.3rem; font-weight: 800;">Dodaj termin do kalendarza</span>',
            html: `
    <div style="display: flex; flex-direction: column; gap: 14px; text-align: left; font-family: 'Inter', sans-serif;">
        <!-- PODSUMOWANIE GODZIN -->
        <div style="background: #fdfaf8; border: 1px solid #f1ece8; padding: 10px 14px; border-radius: 12px; display: flex; justify-content: space-between;">
            <span style="font-size: 0.85rem; color: #7f8c8d;"><b>${selectInfo.start.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</b></span>
            <span style="font-size: 0.9rem; font-weight: 700; color: #d28b5b;">${selectInfo.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${selectInfo.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <!-- POZIOM ZAJĘĆ -->
        <div>
            <label style="font-size: 0.75rem; font-weight: 800; color: #95a5a6; text-transform: uppercase; display: block; margin-bottom: 6px;">Poziom zaawansowania</label>
            <div id="level-options" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <div data-val="Podstawowy" class="swal-option-card active-option" style="padding: 8px; border: 2px solid #d28b5b; background: #fdf2eb; color: #d28b5b; border-radius: 8px; text-align: center; cursor: pointer; font-size: 0.8rem; font-weight: 700;">Podstawowy</div>
                <div data-val="Średni" class="swal-option-card" style="padding: 8px; border: 2px solid #e9ecef; background: #fff; color: #555; border-radius: 8px; text-align: center; cursor: pointer; font-size: 0.8rem; font-weight: 700;">Średni</div>
                <div data-val="Rozszerzony" class="swal-option-card" style="padding: 8px; border: 2px solid #e9ecef; background: #fff; color: #555; border-radius: 8px; text-align: center; cursor: pointer; font-size: 0.8rem; font-weight: 700;">Rozszerzony</div>
            </div>
        </div>

        <!-- TYP ZAJĘĆ -->
        <div>
            <label style="font-size: 0.75rem; font-weight: 800; color: #95a5a6; text-transform: uppercase; display: block; margin-bottom: 6px;">Typ zajęć</label>
            <div id="type-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div data-val="INDIVIDUAL" class="swal-type-card active-type" style="padding: 10px; border: 2px solid #d28b5b; background: #fdf2eb; color: #d28b5b; border-radius: 8px; text-align: center; cursor: pointer; font-size: 0.85rem; font-weight: 700;">Indywidualne</div>
                <div data-val="GROUP" class="swal-type-card" style="padding: 10px; border: 2px solid #e9ecef; background: #fff; color: #555; border-radius: 8px; text-align: center; cursor: pointer; font-size: 0.85rem; font-weight: 700;">Grupowe</div>
            </div>
        </div>

        <!-- ⬇️ NOWE POLE: OPIS SLOTU -->
        <div>
            <label style="font-size: 0.75rem; font-weight: 800; color: #95a5a6; text-transform: uppercase; display: block; margin-bottom: 6px;">Opis zajęć (opcjonalnie)</label>
            <input id="swal-slot-desc" class="swal2-input" style="margin: 0; width: 100%; border-radius: 8px; font-size: 0.85rem;" placeholder="np. Temat: Równania kwadratowe">
        </div>
    </div>
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#d28b5b',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Utwórz slot',
            cancelButtonText: 'Anuluj',
            width: '420px',
            didOpen: () => {
                const levelCards = document.querySelectorAll('#level-options .swal-option-card');
                levelCards.forEach(card => {
                    card.addEventListener('click', () => {
                        levelCards.forEach(c => { c.style.borderColor = '#e9ecef'; c.style.background = '#fff'; c.style.color = '#555'; });
                        card.style.borderColor = '#d28b5b'; card.style.background = '#fdf2eb'; card.style.color = '#d28b5b';
                        selectedLevel = card.getAttribute('data-val');
                    });
                });

                const typeCards = document.querySelectorAll('#type-options .swal-type-card');
                typeCards.forEach(card => {
                    card.addEventListener('click', () => {
                        typeCards.forEach(c => { c.style.borderColor = '#e9ecef'; c.style.background = '#fff'; c.style.color = '#555'; });
                        card.style.borderColor = '#d28b5b'; card.style.background = '#fdf2eb'; card.style.color = '#d28b5b';
                        selectedType = card.getAttribute('data-val');
                    });
                });
            },
            preConfirm: () => ({
                level: selectedLevel,
                lessonType: selectedType,
                description: document.getElementById('swal-slot-desc').value
            })
        });

        if (formValues) {
            try {
                const response = await fetch('http://localhost:8080/api/slots', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        startTime: selectInfo.start.toISOString(),
                        endTime: selectInfo.end.toISOString(),
                        level: formValues.level,
                        lessonType: formValues.lessonType,
                        description: formValues.description
                    })
                });

                if (response.ok) {
                    toast.success("Termin został utworzony!");
                    fetchData(selectInfo.view.activeStart, selectInfo.view.activeEnd);
                }
            } catch (error) {
                toast.error("Błąd połączenia z serwerem");
            }
        }
    };

    const handleEventClick = async (clickInfo) => {
        const { description, slotId, reservations, bookingsCount, maxCapacity, isGroup } = clickInfo.event.extendedProps;

        if (bookingsCount === 0) {
            const result = await Swal.fire({
                title: 'Usuwanie wolnego terminu',
                text: 'Czy na pewno chcesz usunąć ten wolny slot z kalendarza?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e74c3c',
                cancelButtonColor: '#95a5a6',
                confirmButtonText: 'Tak, usuń',
                cancelButtonText: 'Anuluj'
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:8080/api/slots/${clickInfo.event.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        clickInfo.event.remove();
                        toast.success("Slot został usunięty");
                    }
                } catch (error) {
                    toast.error("Błąd serwera");
                }
            }
            return;
        }

        const studentsListHtml = reservations.map(r => `
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee;">
                <span><b>${r.studentName}</b> (${r.studentEmail || 'brak emaila'})</span>
            </li>
        `).join('');

        const studentEmails = reservations.map(r => r.studentEmail).filter(Boolean).join(',');

        Swal.fire({
            title: `<span style="color: #d28b5b; font-size: 1.2rem; font-weight: 700;">${isGroup ? 'Zajęcia Grupowe' : 'Zajęcia Indywidualne'} (${bookingsCount}/${maxCapacity})</span>`,
            html: `
            <div style="font-family: 'Inter', sans-serif; text-align: left; padding: 10px;">
                <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: #777;">
                    Data: <b>${clickInfo.event.start.toLocaleDateString()}</b> (${clickInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${clickInfo.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </p>

                ${description ? `<div style="background: #fdf2eb; color: #d28b5b; padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 12px;"><b>Opis zajęć:</b> ${description}</div>` : ''}

                <p style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">Zapisani uczniowie:</p>
                <ul style="padding-left: 0; list-style: none; margin: 0 0 20px 0;">
                    ${studentsListHtml}
                </ul>

                <div style="display: flex; gap: 8px;">
                    <a href="mailto:${studentEmails}" style="flex: 1; text-align: center; background: #e6f4ff; color: #0070f3; text-decoration: none; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 0.85rem;">
                        ✉️ Wyślij e-mail do grupy
                    </a>
                </div>
            </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: '420px'
        });
    };

    return (
        <div className={styles.adminCalendarContainer}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className={styles.header}>
                <div className={styles.legend}>
                    <span className={styles.legendItem}><div className={styles.boxFree} style={{ background: '#2ecc71' }}></div> Wolny </span>
                    <span className={styles.legendItem}><div className={styles.boxFree} style={{ background: '#f39c12' }}></div> W trakcie zapisów</span>
                    <span className={styles.legendItem}><div className={styles.boxReserved} style={{ background: '#d28b5b' }}></div> Zarezerwowane / Komplet</span>
                </div>
            </div>

            <div className={styles.calendarCard}>
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    locale="pl"
                    selectable={true}
                    events={events}
                    select={handleSelect}
                    eventClick={handleEventClick}
                    datesSet={(dateInfo) => fetchData(dateInfo.start, dateInfo.end)}
                    allDaySlot={false}
                    slotMinTime="07:00:00"
                    slotMaxTime="22:00:00"
                    height="auto"
                />
            </div>
        </div>
    );
};

export default AdminCalendarPage;