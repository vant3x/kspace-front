import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Trash2, Send, Save, Layout, Target, Calendar, Lock, Unlock, Film, Rocket } from 'lucide-react';
import './Admin.css';

export default function Admin() {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Notes State
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [newNote, setNewNote] = useState({ content: '', title: '', size: 'medium', author: '', isQuote: false, quoteSource: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Letter State
    const [letter, setLetter] = useState({ title: '', content: '', sender: '', recipient: '' });
    const [loadingLetter, setLoadingLetter] = useState(true);
    const [isSavingLetter, setIsSavingLetter] = useState(false);

    // Mission State
    const [mission, setMission] = useState({ title: '', targetDate: '', stages: [] });
    const [loadingMission, setLoadingMission] = useState(true);
    const [isSavingMission, setIsSavingMission] = useState(false);

    // Appointments State
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

    // Tabs state
    const [adminTab, setAdminTab] = useState('notes');

    useEffect(() => {
        fetchNotes();
        fetchLetter();
        fetchMission();
        fetchAppointments();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notes`);
            const data = await response.json();
            setNotes(data);
            setLoadingNotes(false);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setLoadingNotes(false);
        }
    };

    const fetchLetter = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/letter`);
            const data = await response.json();
            if (data && data._id) {
                setLetter(data);
            }
            setLoadingLetter(false);
        } catch (error) {
            console.error('Error fetching letter:', error);
            setLoadingLetter(false);
        }
    };

    const fetchMission = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/mission`);
            const data = await response.json();
            setMission({
                ...data,
                targetDate: data.targetDate ? new Date(data.targetDate).toISOString().slice(0, 16) : ''
            });
            setLoadingMission(false);
        } catch (error) {
            console.error('Error fetching mission:', error);
            setLoadingMission(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`);
            const data = await response.json();
            setAppointments(data);
            setLoadingAppointments(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoadingAppointments(false);
        }
    };

    const handleResetAppointments = async () => {
        if (!window.confirm('Are you sure you want to reset all mission responses? This cannot be undone.')) return;
        try {
            await fetch(`${API_BASE_URL}/appointments/clear`, { method: 'DELETE' });
            alert('Mission history reset successfully.');
            fetchAppointments();
        } catch (error) {
            console.error('Error resetting appointments:', error);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        const formData = new FormData();
        formData.append('content', newNote.content);
        formData.append('title', newNote.title);
        formData.append('size', newNote.size);
        formData.append('author', newNote.author);
        formData.append('isQuote', newNote.isQuote);
        formData.append('quoteSource', newNote.quoteSource);
        if (selectedFile) {
            formData.append('media', selectedFile);
        }

        try {
            await fetch(`${API_BASE_URL}/notes`, {
                method: 'POST',
                body: formData
            });
            setNewNote({ content: '', title: '', size: 'medium', author: '', isQuote: false, quoteSource: '' });
            setSelectedFile(null);
            setIsUploading(false);
            fetchNotes();
        } catch (error) {
            console.error('Error adding note:', error);
            setIsUploading(false);
        }
    };

    const deleteNote = async (id) => {
        if (!window.confirm('Delete this memory?')) return;
        try {
            await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
            fetchNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleSaveLetter = async (e) => {
        e.preventDefault();
        setIsSavingLetter(true);
        try {
            const response = await fetch(`${API_BASE_URL}/letter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(letter)
            });
            const data = await response.json();
            setLetter(data);
            setIsSavingLetter(false);
            alert('Cosmic Letter Dispatched! 🚀💫');
        } catch (error) {
            console.error('Error saving letter:', error);
            setIsSavingLetter(false);
        }
    };

    const handleResetMission = async () => {
        if (!window.confirm('Are you sure you want to reset the entire mission to defaults? This will overwrite your current description and stages.')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/mission/reset`, { method: 'DELETE' });
            const data = await response.json();
            setMission({
                ...data,
                targetDate: data.targetDate ? new Date(data.targetDate).toISOString().slice(0, 16) : ''
            });
            alert('Mission restored to initial coordinates.');
        } catch (error) {
            console.error('Error resetting mission:', error);
        }
    };

    const handleSaveMission = async (e) => {
        e.preventDefault();
        setIsSavingMission(true);
        try {
            await fetch(`${API_BASE_URL}/mission`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mission)
            });
            setIsSavingMission(false);
            alert('Mission Directives Updated! 🎯🔭');
        } catch (error) {
            console.error('Error saving mission:', error);
            setIsSavingMission(false);
        }
    };

    const updateStage = (index, field, value) => {
        const newStages = [...mission.stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setMission({ ...mission, stages: newStages });
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>Panel de Despliegue</h1>
                <p>Centro de mando del Universo de K</p>
                <div className="admin-tabs">
                    <button className={adminTab === 'notes' ? 'active' : ''} onClick={() => setAdminTab('notes')}>
                        <ImageIcon size={18} /> Colección
                    </button>
                    <button className={adminTab === 'letter' ? 'active' : ''} onClick={() => setAdminTab('letter')}>
                        <FileText size={18} /> La Carta
                    </button>
                    <button className={adminTab === 'mission' ? 'active' : ''} onClick={() => setAdminTab('mission')}>
                        <Target size={18} /> La Misión
                    </button>
                    <button className={adminTab === 'status' ? 'active' : ''} onClick={() => setAdminTab('status')}>
                        <Calendar size={18} /> Estado
                    </button>
                </div>
            </header>

            <div className="admin-content">
                {adminTab === 'notes' && (
                    <>
                        <section className="admin-form-section">
                            <h2>Desplegar Nuevo Recuerdo</h2>
                            <form className="admin-form" onSubmit={handleAddNote}>
                                <div className="form-group"><label>Título</label><input type="text" value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })} /></div>
                                <div className="form-group"><label>Contenido</label><textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })} /></div>
                                <div className="form-group">
                                    <label>Tamaño de Visualización</label>
                                    <select value={newNote.size} onChange={e => setNewNote({ ...newNote, size: e.target.value })}>
                                        <option value="small">Pequeño</option>
                                        <option value="medium">Mediano</option>
                                        <option value="tall">Alto</option>
                                        <option value="wide">Ancho</option>
                                    </select>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input type="checkbox" checked={newNote.isQuote} onChange={e => setNewNote({ ...newNote, isQuote: e.target.checked })} />
                                        ¿Es una nota de autor/cita?
                                    </label>
                                </div>
                                {newNote.isQuote && (
                                    <>
                                        <div className="form-group"><label>Nombre del Autor</label><input type="text" value={newNote.author} onChange={e => setNewNote({ ...newNote, author: e.target.value })} /></div>
                                        <div className="form-group"><label>Origen de la Cita (Opcional)</label><input type="text" value={newNote.quoteSource} onChange={e => setNewNote({ ...newNote, quoteSource: e.target.value })} /></div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label>Media</label>
                                    <div className="admin-file-upload">
                                        <label htmlFor="admin-upload">{selectedFile ? selectedFile.name : '📁 Elegir Archivo'}</label>
                                        <input id="admin-upload" type="file" onChange={e => setSelectedFile(e.target.files[0])} />
                                    </div>
                                </div>
                                <button type="submit" className="admin-submit">{isUploading ? 'Warping...' : 'Desplegar'}</button>
                            </form>
                        </section>
                        <section className="admin-list-section">
                            <h2>Colección Actual</h2>
                            <div className="admin-notes-grid">
                                {notes.map(note => (
                                    <div key={note._id} className="admin-note-card">
                                        <div className="note-card-media">
                                            {note.src ? (
                                                note.mediaType === 'video' ? (
                                                    <div className="media-preview video"><Film size={24} color="#fbbf24" /></div>
                                                ) : (
                                                    <img src={note.src} alt={note.title} />
                                                )
                                            ) : (
                                                <div className="media-preview text"><FileText size={20} color="#666" /></div>
                                            )}
                                        </div>
                                        <div className="note-card-info">
                                            <h3>{note.title || 'Sin Título'}</h3>
                                            <p>{note.content?.substring(0, 50)}{note.content?.length > 50 ? '...' : ''}</p>
                                        </div>
                                        <button className="admin-delete-btn" onClick={() => deleteNote(note._id)}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {adminTab === 'letter' && (
                    <section className="admin-letter-section">
                        <h2>Redactando Carta</h2>
                        <form className="admin-letter-form" onSubmit={handleSaveLetter}>
                            <div className="form-group"><label>Para:</label><input type="text" value={letter.recipient} onChange={e => setLetter({ ...letter, recipient: e.target.value })} /></div>
                            <div className="form-group"><label>Título</label><input type="text" value={letter.title} onChange={e => setLetter({ ...letter, title: e.target.value })} /></div>
                            <div className="form-group"><label>Mensaje</label><textarea className="letter-textarea" value={letter.content} onChange={e => setLetter({ ...letter, content: e.target.value })} /></div>
                            <div className="form-group"><label>De:</label><input type="text" value={letter.sender} onChange={e => setLetter({ ...letter, sender: e.target.value })} /></div>
                            <button type="submit" className="admin-submit">{isSavingLetter ? 'Guardando...' : 'Enviar Carta'}</button>
                        </form>
                    </section>
                )}

                {adminTab === 'mission' && (
                    <section className="admin-mission-section">
                        <div className="section-header-with-action">
                            <h2>Directivas de la Misión</h2>
                            <button type="button" className="admin-reset-btn" onClick={handleResetMission}>
                                <Rocket size={16} /> Restaurar Predeterminados
                            </button>
                        </div>
                        <form className="admin-mission-form" onSubmit={handleSaveMission}>
                            <div className="form-group">
                                <label>Título del Objetivo Principal</label>
                                <input type="text" value={mission.title} onChange={e => setMission({ ...mission, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Fecha y Hora Objetivo</label>
                                <input type="datetime-local" value={mission.targetDate} onChange={e => setMission({ ...mission, targetDate: e.target.value })} />
                            </div>

                            <div className="stages-editor">
                                <h3>Etapas Moleculares</h3>
                                {mission.stages && mission.stages.map((stage, idx) => (
                                    <div key={idx} className="stage-edit-card">
                                        <div className="stage-edit-header">
                                            <h4>Etapa {idx + 1}: {stage.label}</h4>
                                            <button type="button" className={`lock-toggle ${stage.isLocked ? 'locked' : ''}`} onClick={() => updateStage(idx, 'isLocked', !stage.isLocked)}>
                                                {stage.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                            </button>
                                        </div>
                                        <div className="stage-fields-grid">
                                            <div className="form-group"><label>Símbolo</label><input type="text" value={stage.symbol} onChange={e => updateStage(idx, 'symbol', e.target.value)} /></div>
                                            <div className="form-group"><label>Etiqueta</label><input type="text" value={stage.label} onChange={e => updateStage(idx, 'label', e.target.value)} /></div>
                                            <div className="form-group"><label>Título de la Etapa</label><input type="text" value={stage.title} onChange={e => updateStage(idx, 'title', e.target.value)} /></div>
                                            <div className="form-group"><label>Fórmula Química</label><input type="text" value={stage.formula} onChange={e => updateStage(idx, 'formula', e.target.value)} /></div>
                                        </div>
                                        <div className="form-group"><label>Detalles de la Misión</label><textarea value={stage.description} onChange={e => updateStage(idx, 'description', e.target.value)} /></div>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="admin-submit" disabled={isSavingMission}>
                                {isSavingMission ? 'Sincronizando...' : 'Actualizar Control de Misión'}
                            </button>
                        </form>
                    </section>
                )}

                {adminTab === 'status' && (
                    <section className="admin-status-section">
                        <div className="section-header-with-action">
                            <h2>Respuestas de la Misión</h2>
                            <button className="admin-reset-btn" onClick={handleResetAppointments}>
                                <Trash2 size={16} /> Reiniciar Todas las Respuestas
                            </button>
                        </div>
                        <div className="appointments-list">
                            {appointments.length === 0 ? (
                                <p className="no-data">Aún no hay respuestas del Control de Misión.</p>
                            ) : (
                                appointments.map(app => (
                                    <div key={app._id} className={`appointment-card ${app.status}`}>
                                        <div className="app-header">
                                            <span className="app-status-badge">{app.status.toUpperCase()}</span>
                                            <span className="app-date">
                                                {app.status === 'accepted' ? 'Aceptado el: ' : 'Rechazado el: '}
                                                {new Date(app.createdAt).toLocaleDateString()} {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="app-body">
                                            <p><strong>Usuario:</strong> {app.userName}</p>
                                            <p><strong>Misión:</strong> {app.missionType}</p>
                                            <p className="app-message">"{app.message}"</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
