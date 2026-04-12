import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../models/card.dart';
import '../models/game.dart'; // for LocalizedString
import '../services/api_service.dart';

class AdminCardFormScreen extends StatefulWidget {
  final GameCard? card; // If null, we are creating

  const AdminCardFormScreen({super.key, this.card});

  @override
  State<AdminCardFormScreen> createState() => _AdminCardFormScreenState();
}

class _AdminCardFormScreenState extends State<AdminCardFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controllers
  final _gameIdCtrl = TextEditingController();
  final _nameEnCtrl = TextEditingController();
  final _nameIdCtrl = TextEditingController();
  final _typeEnCtrl = TextEditingController();
  final _typeIdCtrl = TextEditingController();
  final _effectEnCtrl = TextEditingController();
  final _effectIdCtrl = TextEditingController();
  final _loreEnCtrl = TextEditingController();
  final _loreIdCtrl = TextEditingController();
  final _imageUrlCtrl = TextEditingController();
  final _colorCtrl = TextEditingController();
  
  final _hpCtrl = TextEditingController();
  final _manaCtrl = TextEditingController();
  final _attackCtrl = TextEditingController();
  final _defenseCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.card != null) {
      final c = widget.card!;
      _gameIdCtrl.text = c.gameId;
      _nameEnCtrl.text = c.name.en;
      _nameIdCtrl.text = c.name.id;
      _typeEnCtrl.text = c.type.en;
      _typeIdCtrl.text = c.type.id;
      _effectEnCtrl.text = c.effect.en;
      _effectIdCtrl.text = c.effect.id;
      _loreEnCtrl.text = c.lore.en;
      _loreIdCtrl.text = c.lore.id;
      _imageUrlCtrl.text = c.imageUrl;
      _colorCtrl.text = c.color;
      if (c.hp != null) _hpCtrl.text = c.hp.toString();
      if (c.mana != null) _manaCtrl.text = c.mana.toString();
      if (c.attack != null) _attackCtrl.text = c.attack.toString();
      if (c.defense != null) _defenseCtrl.text = c.defense.toString();
    } else {
      _colorCtrl.text = '#ffffff'; // Default color
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final card = GameCard(
      id: widget.card?.id ?? '', // backend generates if empty
      gameId: _gameIdCtrl.text.trim(),
      name: LocalizedString(en: _nameEnCtrl.text.trim(), id: _nameIdCtrl.text.trim()),
      type: LocalizedString(en: _typeEnCtrl.text.trim(), id: _typeIdCtrl.text.trim()),
      effect: LocalizedString(en: _effectEnCtrl.text.trim(), id: _effectIdCtrl.text.trim()),
      lore: LocalizedString(en: _loreEnCtrl.text.trim(), id: _loreIdCtrl.text.trim()),
      imageUrl: _imageUrlCtrl.text.trim(),
      color: _colorCtrl.text.trim(),
      hp: int.tryParse(_hpCtrl.text.trim()),
      mana: int.tryParse(_manaCtrl.text.trim()),
      attack: int.tryParse(_attackCtrl.text.trim()),
      defense: int.tryParse(_defenseCtrl.text.trim()),
    );

    try {
      if (widget.card == null) {
        await ApiService.createCard(card);
      } else {
        await ApiService.updateCard(card);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(widget.card == null ? 'Card Created!' : 'Card Updated!')));
        context.pop(true); // Return true to trigger refresh in lists
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickAndUploadImage(TextEditingController ctrl) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile == null) return;
    
    setState(() => _isLoading = true);
    try {
      final file = File(pickedFile.path);
      final url = await ApiService.uploadImage(file);
      setState(() => ctrl.text = url);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Image securely hosted!')));
    } catch(e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload crashed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.card == null ? 'Create Card' : 'Edit Card'),
        actions: [
          _isLoading 
            ? const Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator())
            : IconButton(icon: const Icon(LucideIcons.save), onPressed: _submit),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            _buildSectionHead('Core Linkage'),
            _buildField('Game ID (e.g. hts)', _gameIdCtrl, required: true),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: _buildField('Image URL', _imageUrlCtrl)),
                const SizedBox(width: 8),
                Container(
                  height: 55,
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : () => _pickAndUploadImage(_imageUrlCtrl),
                    icon: const Icon(LucideIcons.imagePlus),
                    label: const Text('Local'),
                  ),
                )
              ],
            ),
            _buildField('Hex Color (e.g. #ef4444)', _colorCtrl),
            
            const SizedBox(height: 16),
            _buildSectionHead('Localization: Name & Type'),
            _buildField('Name (EN)', _nameEnCtrl, required: true),
            _buildField('Name (ID)', _nameIdCtrl),
            _buildField('Type/Class (EN)', _typeEnCtrl, required: true),
            _buildField('Type/Class (ID)', _typeIdCtrl),

            const SizedBox(height: 16),
            _buildSectionHead('Localization: Text Body'),
            _buildField('Effect Description (EN)', _effectEnCtrl, maxLines: 3),
            _buildField('Effect Description (ID)', _effectIdCtrl, maxLines: 3),
            _buildField('Lore (EN)', _loreEnCtrl, maxLines: 2),
            _buildField('Lore (ID)', _loreIdCtrl, maxLines: 2),

            const SizedBox(height: 16),
            _buildSectionHead('Combat Modifiers (Optional)'),
            Row(
              children: [
                Expanded(child: _buildField('HP', _hpCtrl, type: TextInputType.number)),
                const SizedBox(width: 8),
                Expanded(child: _buildField('Mana', _manaCtrl, type: TextInputType.number)),
              ],
            ),
            Row(
              children: [
                Expanded(child: _buildField('Attack', _attackCtrl, type: TextInputType.number)),
                const SizedBox(width: 8),
                Expanded(child: _buildField('Defense', _defenseCtrl, type: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHead(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, {bool required = false, int maxLines = 1, TextInputType type = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        controller: ctrl,
        maxLines: maxLines,
        keyboardType: type,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
        ),
        validator: required ? (v) => (v == null || v.isEmpty) ? 'Required' : null : null,
      ),
    );
  }
}
