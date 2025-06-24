import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff6b6b', '#00c49f', '#ff8c00', '#8dd1e1'];

export default function CatatanKeuangan() {
  const [catatan, setCatatan] = useState([]);
  const [form, setForm] = useState({ deskripsi: '', jumlah: '', tipe: 'pengeluaran', kategori: '' });
  const [totalGaji, setTotalGaji] = useState(0);
  const [tabungan, setTabungan] = useState(0);

  useEffect(() => {
    const dataLokal = localStorage.getItem('catatanKeuangan');
    if (dataLokal) {
      const parsed = JSON.parse(dataLokal);
      setCatatan(parsed.catatan);
      setTotalGaji(parsed.totalGaji);
      setTabungan(parsed.tabungan);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('catatanKeuangan', JSON.stringify({ catatan, totalGaji, tabungan }));
  }, [catatan, totalGaji, tabungan]);

  const tambahCatatan = () => {
    if (!form.deskripsi || !form.jumlah || (form.tipe === 'pengeluaran' && !form.kategori)) return;
    setCatatan([...catatan, { ...form, jumlah: parseFloat(form.jumlah), waktu: new Date() }]);
    setForm({ deskripsi: '', jumlah: '', tipe: 'pengeluaran', kategori: '' });
  };

  const exportKeExcel = () => {
    const header = ["Deskripsi", "Jumlah", "Tipe", "Kategori", "Waktu"];
    const rows = catatan.map(c => [c.deskripsi, c.jumlah, c.tipe, c.kategori, new Date(c.waktu).toLocaleString()]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "catatan_keuangan.csv");
    link.click();
  };

  const total = catatan.reduce((acc, curr) => {
    return curr.tipe === 'pemasukan' ? acc + curr.jumlah : acc - curr.jumlah;
  }, 0);

  const pengeluaranData = catatan.filter(c => c.tipe === 'pengeluaran')
    .reduce((acc, curr) => {
      const found = acc.find(a => a.name === curr.kategori);
      if (found) {
        found.value += curr.jumlah;
      } else {
        acc.push({ name: curr.kategori, value: curr.jumlah });
      }
      return acc;
    }, []);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Catatan Keuangan Harian</h1>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div>
            <Label>Total Gaji (per bulan)</Label>
            <Input
              type="number"
              value={totalGaji}
              onChange={e => setTotalGaji(parseFloat(e.target.value))}
              placeholder="Contoh: 9000000"
            />
          </div>
          <div>
            <Label>Tabungan Saat Ini</Label>
            <Input
              type="number"
              value={tabungan}
              onChange={e => setTabungan(parseFloat(e.target.value))}
              placeholder="Contoh: 11000000"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div>
            <Label>Deskripsi</Label>
            <Input
              value={form.deskripsi}
              onChange={e => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Contoh: Beli kopi"
            />
          </div>
          <div>
            <Label>Jumlah (Rp)</Label>
            <Input
              type="number"
              value={form.jumlah}
              onChange={e => setForm({ ...form, jumlah: e.target.value })}
              placeholder="10000"
            />
          </div>
          <div>
            <Label>Tipe</Label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.tipe}
              onChange={e => setForm({ ...form, tipe: e.target.value, kategori: '' })}
            >
              <option value="pengeluaran">Pengeluaran</option>
              <option value="pemasukan">Pemasukan</option>
            </select>
          </div>
          {form.tipe === 'pengeluaran' && (
            <div>
              <Label>Kategori Pengeluaran</Label>
              <select
                className="w-full border rounded px-2 py-1"
                value={form.kategori}
                onChange={e => setForm({ ...form, kategori: e.target.value })}
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="Makan">Biaya Makan</option>
                <option value="Air">Biaya Air</option>
                <option value="Listrik">Biaya Listrik</option>
                <option value="Internet">Biaya Internet</option>
                <option value="Transportasi">Biaya Transportasi</option>
                <option value="Jajan & Pacar">Biaya Jajan & Jalan Sama Pacar</option>
                <option value="Dapur">Biaya Dapur & Peralatan Rumah</option>
              </select>
            </div>
          )}
          <Button onClick={tambahCatatan}>Tambah Catatan</Button>
        </CardContent>
      </Card>

      <div className="text-lg font-semibold text-center">Saldo Sekarang: Rp {total.toLocaleString()}</div>
      <div className="text-md text-center">Tabungan: Rp {tabungan.toLocaleString()}</div>
      <div className="text-sm text-center text-gray-500">Belajar investasi dimulai dari mencatat uangmu. Konsisten itu cuan! 💪📈</div>

      <Button className="w-full" onClick={exportKeExcel}>Export ke Excel</Button>

      {pengeluaranData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-bold text-center">Distribusi Pengeluaran</h2>
            <PieChart width={300} height={300} className="mx-auto">
              <Pie
                dataKey="value"
                isAnimationActive={false}
                data={pengeluaranData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pengeluaranData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {catatan.map((item, index) => (
          <Card key={index} className="border-l-4" style={{ borderColor: item.tipe === 'pengeluaran' ? '#f87171' : '#34d399' }}>
            <CardContent className="p-4">
              <div className="font-medium">{item.deskripsi}</div>
              <div className="text-sm">
                {item.tipe === 'pengeluaran' ? '-' : '+'}Rp {item.jumlah.toLocaleString()} | {item.kategori && `Kategori: ${item.kategori} | `}{new Date(item.waktu).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
