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
                `http://localhost:8080/api/slots/available?from=${start.toISOString()}&to=${end.toISOString()}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const slotsData = await slotsRes.json();

            const reservationsRes = await fetch(
                `http://localhost:8080/api/reservations`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const reservationsData = await reservationsRes.json();


            const activeReservations = reservationsData.filter(res => res.status !== 'CANCELLED');


            const calendarEvents = slotsData.map(slot => {
                const isGroup = slot.lessonType && slot.lessonType.toString().toLowerCase().includes('group');
                const maxCapacity = slot.capacity || (isGroup ? 5 : 1);


                const matchingReservations = activeReservations.filter(res => {
                    const slotId = res.slotId || res.availabilitySlot?.id;
                    return slotId === slot.id || (res.startTime === slot.startTime && res.endTime === slot.endTime);
                });

                const bookingsCount = matchingReservations.length;
                const isFull = bookingsCount >= maxCapacity;


                let bgBtnColor = '#2ecc71';
                let statusTitle = `WOLNY (${slot.level || ''} - ${isGroup ? 'Grupowe' : 'Indyw.'})`;

                if (bookingsCount > 0 && !isFull) {
                    bgBtnColor = '#f39c12';
                    statusTitle = `GRUPA (${bookingsCount}/${maxCapacity}): ${matchingReservations.map(r => r.studentName).join(', ')}`;
                } else if (isFull) {
                    bgBtnColor = '#d28b5b';
                    statusTitle = isGroup
                        ? `KOMPLET (${bookingsCount}/${maxCapacity}): ${matchingReservations.map(r => r.studentName).join(', ')}`
                        : `ZAREZERWOWANE: ${matchingReservations.map(r => r.studentName).join(', ') || 'Uczeń'}`;
                }

                return {
                    id: slot.id,
                    start: slot.startTime,
                    end: slot.endTime,
                    title: statusTitle,
                    backgroundColor: bgBtnColor,
                    textColor: '#ffffff',
                    extendedProps: {
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
            toast.error("Błąd pobierania danych kalendarza");
        }
    };

    const handleSelect = async (selectInfo) => {
        let selectedLevel = 'Podstawowy';
        let selectedType = 'INDIVIDUAL';

        const { value: formValues } = await Swal.fire({
            title: '<span style="color: #2c3e50; font-size: 1.3rem; font-weight: 800;">Dodaj termin do kalendarza</span>',
            html: `
            <div style="display: flex; flex-direction: column; gap: 16px; text-align: left; font-family: 'Inter', sans-serif; padding-top: 5px;">
                <div style="background: #fdfaf8; border: 1px solid #f1ece8; padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.85rem; color: #7f8c8d;">
                        <b>${selectInfo.start.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</b>
                    </div>
                    <div style="font-size: 0.9rem; font-weight: 700; color: #d28b5b;">
                        ${selectInfo.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${selectInfo.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                <div>
                    <label style="font-size: 0.75rem; font-weight: 800; color: #95a5a6; text-transform: uppercase; display: block; margin-bottom: 8px;">
                        Poziom zaawansowania
                    </label>
                    <div id="level-options" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        <div data-val="Podstawowy" class="swal-option-card active-option" style="padding: 10px 8px; border: 2px solid #d28b5b; background: #fdf2eb; color: #d28b5b; border-radius: 10px; text-align: center; cursor: pointer; font-size: 0.8rem; font-weight: 700;">Podstawowy</div>
                        <div data-val="Średni" class="swal-option-card" style="padding: 10px 8px; border: 2px solid #e9ecef; background: #fff; color: #555; border-radius: 10px; text-align: center; cursor: pointer; font-size: 0.8rem; font-weight: 700;">Średni</div>
                        <div data-val="Rozszerzony" class="swal-option-card" style="padding: 10px 8px; border: 2px solid #e9ecef; background: #fff; color: #555; border-radius: 10px; text-align: center; cursor: pointer; font-size: 0.8rem; font-weight: 700;">Rozszerzony</div>
                    </div>
                </div>

                <div>
                    <label style="font-size: 0.75rem; font-weight: 800; color: #95a5a6; text-transform: uppercase; display: block; margin-bottom: 8px;">
                        Typ zajęć
                    </label>
                    <div id="type-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div data-val="INDIVIDUAL" class="swal-type-card active-type" style="padding: 12px; border: 2px solid #d28b5b; background: #fdf2eb; color: #d28b5b; border-radius: 12px; text-align: center; cursor: pointer; font-size: 0.85rem; font-weight: 700;">Indywidualne</div>
                        <div data-val="GROUP" class="swal-type-card" style="padding: 12px; border: 2px solid #e9ecef; background: #fff; color: #555; border-radius: 12px; text-align: center; cursor: pointer; font-size: 0.85rem; font-weight: 700;">Grupowe</div>
                    </div>
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
            customClass: { popup: styles.swalSoftPopup },
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
            preConfirm: () => ({ level: selectedLevel, lessonType: selectedType })
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
                        lessonType: formValues.lessonType
                    })
                });

                if (response.ok) {
                    toast.success("Termin został utworzony!");
                    fetchData(selectInfo.view.activeStart, selectInfo.view.activeEnd);
                } else {
                    const errData = await response.json();
                    toast.error("Błąd zapisu slotu: " + (errData.message || 'Niepoprawne dane'));
                }
            } catch (error) {
                toast.error("Błąd połączenia z serwerem");
            }
        }
    };

    const handleEventClick = async (clickInfo) => {
        const { slotId, reservations, bookingsCount, maxCapacity, isGroup } = clickInfo.event.extendedProps;

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